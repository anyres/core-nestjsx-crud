
import { AnyresCRUD } from "@anyres/core";
import { Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

export enum DilterConditions {
  eq = 'eq', // (=, equal)
  ne = 'ne', // (!=, not equal)
  gt = 'gt', // (>, greater than)
  lt = 'lt', // (<, lower that)
  gte = 'gte', // (>=, greater than or equal)
  lte = 'lte', // (<=, lower than or equal)
  starts = 'starts', // (LIKE val%, starts with)
  ends = 'ends', // (LIKE %val, ends with)
  cont = 'cont', // (LIKE %val%, contains)
  excl = 'excl', // (NOT LIKE %val%, not contains)
  in = 'in', // (IN, in range, accepts multiple values)
  notin = 'notin', // (NOT IN, not in range, accepts multiple values)
  isnull = 'isnull', // (IS NULL, is NULL, doesn't accept value)
  notnull = 'notnull', // (IS NOT NULL, not NULL, doesn't accept value)
  between = 'between', // (BETWEEN, between, accepts two values)
}

export interface IFilter<T> {
  field: T;
  condition: DilterConditions;
  value: string;
}

export interface ISort<T> {
  field: T;
  by: 'DESC' | 'ASC';
}

export interface IJoin {
  relation: string;
  fields?: string[];
}

export interface INestjsxResQuery<T> {
  fields?: Array<keyof T>;
  filter?: IFilter<keyof T>[];
  or?: IFilter<keyof T>[];
  sort?: ISort<keyof T>[];
  join?: IJoin[];
  limit?: number;
  offset?: number;
  page?: number;
  cache?: 0;
}

export type INestjsxResQueryResult<T> = T[];

export interface INestjsxResGet {
}

export interface INestjsxResCreate {
}

export interface INestjsxResUpdate {
}


export class AnyresNestjsxCRUD<
  TQ extends INestjsxResQuery<TG>,
  TG extends INestjsxResGet,
  TC extends INestjsxResCreate,
  TU extends INestjsxResUpdate
  > extends AnyresCRUD<
  TQ,
  INestjsxResQueryResult<TG>,
  TG,
  TC,
  TU
  > {
  formatFields(query: TQ): string {
    if (query && query.fields) {
      return `fields=${query.fields.join(",")}`;
    } else {
      return "";
    }
  }

  formatFilter(query: TQ) {
    if (query && query.filter) {
      return query.filter.map(filter => `filter=${filter.field}||${filter.condition}||${filter.value}`).join('&')
    } else {
      return "";
    }
  }
  formatOr(query: TQ) {
    if (query && query.or) {
      return query.or.map(or => `or=${or.field}||${or.condition}||${or.value}`).join('&')
    } else {
      return "";
    }
  }
  formatSort(query: TQ) {
    if (query && query.sort) {
      return query.sort.map(sort => `sort=${sort.field},${sort.by}`).join('&')
    } else {
      return "";
    }
  }
  formatJoin(query: TQ) {
    if (query && query.join) {
      return query.join.map(join => {
        if (join.fields) {
          return `join=${join.relation}||${join.fields.join(",")}`
        } else {
          return `join=${join.relation}`
        }
      }).join('&')
    } else {
      return "";
    }
  }
  public get(id: string | number, query?: TQ): Observable<TG> {
    return this.getHeaders$().pipe(
      switchMap((headers) => {
        return this.httpAdapter.get(`${this.path}/${id}?${this.formatFields(query)}&${this.formatJoin(query)}`, {
          headers,
        });
      }),
      map((response) => response.json() as TG),
      catchError((err: any) => {
        this.errorHandler(err);
        return throwError(err);
      }),
    );
  }

  public query(query?: TQ): Observable<INestjsxResQueryResult<TG>> {
    return this.getHeaders$().pipe(
      switchMap((headers) => {
        return this.httpAdapter.get(`${this.path}?${
          this.formatFields(query)
          }&${
          this.formatJoin(query)
          }&${
          this.formatFilter(query)
          }&${
          this.formatOr(query)
          }&${
          this.formatSort(query)
          }`, {
            params: {
              limit: query.limit ? query.limit : '',
              offset: query.offset ? query.offset : '',
              page: query.page ? query.page : '',
              cache: query.cache ? query.cache : ''
            },
            headers,
          });
      }),
      map((response) => response.json() as INestjsxResQueryResult<TG>),
      catchError((err: any) => {
        this.errorHandler(err);
        return throwError(err);
      }),
    );
  }

}
