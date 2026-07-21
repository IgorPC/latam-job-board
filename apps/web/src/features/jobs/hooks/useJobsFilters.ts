import { useReducer } from 'react';
import type { JobLatamFilter, JobSince, JobTypeFilter, JobsQuery } from '../types/job.types';

interface FiltersState {
  search: string;
  since: JobSince;
  type: JobTypeFilter | 'all';
  latam: JobLatamFilter | 'all';
  sources: string[];
  page: number;
}

type FiltersAction =
  | { type: 'SET_SEARCH'; value: string }
  | { type: 'SET_SINCE'; value: JobSince }
  | { type: 'SET_TYPE'; value: JobTypeFilter | 'all' }
  | { type: 'SET_LATAM'; value: JobLatamFilter | 'all' }
  | { type: 'SET_SOURCES'; value: string[] }
  | { type: 'SET_PAGE'; value: number };

const initialState: FiltersState = {
  search: '',
  since: 'all',
  type: 'all',
  latam: 'all',
  sources: [],
  page: 1,
};

function reducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.value, page: 1 };
    case 'SET_SINCE':
      return { ...state, since: action.value, page: 1 };
    case 'SET_TYPE':
      return { ...state, type: action.value, page: 1 };
    case 'SET_LATAM':
      return { ...state, latam: action.value, page: 1 };
    case 'SET_SOURCES':
      return { ...state, sources: action.value, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.value };
    default:
      return state;
  }
}

export function useJobsFilters() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const query: JobsQuery = {
    search: state.search || undefined,
    since: state.since === 'all' ? undefined : state.since,
    type: state.type === 'all' ? undefined : state.type,
    latam: state.latam === 'all' ? undefined : state.latam,
    sources: state.sources.length > 0 ? state.sources : undefined,
    page: state.page,
    limit: 20,
  };

  return { state, dispatch, query };
}
