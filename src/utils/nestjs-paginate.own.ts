import { Paginated as _Paginated, PaginateQuery } from 'nestjs-paginate';
import { ObjectLiteral, Repository } from 'typeorm';
import { FilterOperator } from 'nestjs-paginate';

export interface PaginatedCounterItem {
  value: string;
  quant: number;
}

interface CounterRawRow {
  [key: string]: string | number | null | undefined;
  quant: string;
}

export interface Paginated<T> extends _Paginated<T> {
  counter?: PaginatedCounterItem[];
}

export async function countByFieldUsingPaginateFilters<T extends ObjectLiteral>(
  repository: Repository<T>,
  query: PaginateQuery,
  field: keyof T,
) {
  const filters = query.filter || {};
  const alias = repository.metadata.name;
  const queryBuilder = repository.createQueryBuilder(alias);

  const REGEX = new RegExp(
    `^\\$(${Object.keys(FilterOperator)
      .filter((op) => op !== 'NULL')
      .join('|')}):`,
    'i',
  );
  const NULL_REGEX = /^\$(null|not:\$null)$/i;

  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      const filterValues = Array.isArray(filters[key])
        ? filters[key]
        : [filters[key]];

      filterValues.forEach((filterValue, index) => {
        let value = filterValue;
        let operator = '=';

        // Extract nestjs-paginate filter operators
        if (typeof filterValue === 'string') {
          const match =
            filterValue.match(REGEX) || filterValue.match(NULL_REGEX);
          if (match) {
            const op = match[1].toLowerCase();
            if (op === 'ilike') {
              operator = 'ILIKE';
            } else if (op === 'null') {
              operator = 'IS NULL';
            } else if (op === 'not:$null') {
              operator = 'IS NOT NULL';
              value = '';
            }
            value = filterValue.replace(REGEX, '');
          }
        }

        if (index === 0 && filterValues.length === 1) {
          if (operator === 'IS NULL') {
            queryBuilder.andWhere(`${alias}.${key} IS NULL`);
          } else if (operator === 'IS NOT NULL') {
            queryBuilder.andWhere(`${alias}.${key} IS NOT NULL`);
          } else if (operator === 'ILIKE') {
            queryBuilder.andWhere(`${alias}.${key} ILIKE :${key}`, {
              [key]: `%${value}%`,
            });
          } else {
            queryBuilder.andWhere(`${alias}.${key} = :${key}`, {
              [key]: value,
            });
          }
        } else if (filterValues.length > 1) {
          if (index === 0) {
            const hasIlike = filterValues.some(
              (v) =>
                typeof v === 'string' &&
                v.match(REGEX)?.[1]?.toLowerCase() === 'ilike',
            );

            if (hasIlike) {
              filterValues.forEach((v, i) => {
                const cleanValue =
                  typeof v === 'string' ? v.replace(REGEX, '') : v;
                queryBuilder.orWhere(`${alias}.${key} ILIKE :${key}${i}`, {
                  [`${key}${i}`]: `%${cleanValue}%`,
                });
              });
            } else {
              queryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, {
                [key]: filterValues.map((v) =>
                  typeof v === 'string' ? v.replace(REGEX, '') : v,
                ),
              });
            }
            return;
          }
        }
      });
    }
  });

  const result = await queryBuilder
    .select(`${alias}.${field as string}`, field as string)
    .addSelect('COUNT(*)', 'quant')
    .groupBy(`${alias}.${field as string}`)
    .orderBy(`${alias}.${field as string}`, 'ASC')
    .getRawMany<CounterRawRow>();

  return result.map((row) => ({
    value: String(row[field as string] ?? ''),
    quant: Number.parseInt(row.quant, 10),
  }));
}
