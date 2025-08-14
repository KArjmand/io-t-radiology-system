import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { PaginationDto } from '../dto/pagination.dto';

/**
 * Creates a paginated response from query results and pagination parameters
 * @param items Array of items for the current page
 * @param total Total number of items across all pages
 * @param paginationDto Pagination parameters (page, limit)
 * @returns A standardized paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  paginationDto: PaginationDto,
): PaginatedResponseDto<T> {
  const { page, limit } = paginationDto;
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
