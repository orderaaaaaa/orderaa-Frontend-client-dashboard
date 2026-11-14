import api from './index';
import type {
  AddStocktakeLinesDto,
  CreateStocktakeDto,
  ListStocktakesQueryDto,
  PostStocktakeDto,
  PostStocktakeResultDto,
  RemoveStocktakeLinesDto,
  StocktakeLineDto,
  StocktakeLinesPageDto,
  StocktakeLinesQueryDto,
  StocktakeListDto,
  StocktakeSelectionDto,
  StocktakeSummaryDto,
  StocktakeTypeOptionDto,
  UpdateStocktakeLinesDto,
} from '@/app/dashboard/inventory/stock-management/types/stocktake';

const STOCKTAKES_PATH = '/stock-movements/stocktakes';
const CHANGED_LINES_PAGE_SIZE = 100;

export async function getStocktakes(
  params?: ListStocktakesQueryDto
): Promise<StocktakeListDto> {
  const response = await api.get(STOCKTAKES_PATH, { params });
  return response.data as StocktakeListDto;
}

export async function getStocktakeTypes(): Promise<StocktakeTypeOptionDto[]> {
  const response = await api.get(`${STOCKTAKES_PATH}/types`);
  return response.data as StocktakeTypeOptionDto[];
}

export async function startStocktake(
  body: CreateStocktakeDto
): Promise<StocktakeSummaryDto> {
  const response = await api.post(STOCKTAKES_PATH, body);
  return response.data as StocktakeSummaryDto;
}

export async function getStocktake(id: number): Promise<StocktakeSummaryDto> {
  const response = await api.get(`${STOCKTAKES_PATH}/${id}`);
  return response.data as StocktakeSummaryDto;
}

export async function getStocktakeLines(
  id: number,
  params?: StocktakeLinesQueryDto
): Promise<StocktakeLinesPageDto> {
  const response = await api.get(`${STOCKTAKES_PATH}/${id}/lines`, { params });
  return response.data as StocktakeLinesPageDto;
}

export async function getAllChangedStocktakeLines(
  id: number
): Promise<StocktakeLineDto[]> {
  const lines: StocktakeLineDto[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await getStocktakeLines(id, {
      filter: 'CHANGED',
      page,
      pageSize: CHANGED_LINES_PAGE_SIZE,
    });
    lines.push(...result.data);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);
  return lines;
}

export async function updateStocktakeLines(
  id: number,
  body: UpdateStocktakeLinesDto
): Promise<StocktakeSummaryDto> {
  const response = await api.patch(`${STOCKTAKES_PATH}/${id}/lines`, body);
  return response.data as StocktakeSummaryDto;
}

export async function getStocktakeSelection(
  id: number
): Promise<StocktakeSelectionDto> {
  const response = await api.get(`${STOCKTAKES_PATH}/${id}/selection`);
  return response.data as StocktakeSelectionDto;
}

export async function addStocktakeLines(
  id: number,
  body: AddStocktakeLinesDto
): Promise<StocktakeSummaryDto> {
  const response = await api.post(`${STOCKTAKES_PATH}/${id}/lines`, body);
  return response.data as StocktakeSummaryDto;
}

export async function removeStocktakeLines(
  id: number,
  body: RemoveStocktakeLinesDto
): Promise<StocktakeSummaryDto> {
  const response = await api.post(`${STOCKTAKES_PATH}/${id}/lines/remove`, body);
  return response.data as StocktakeSummaryDto;
}

export async function postStocktake(
  id: number,
  body: PostStocktakeDto
): Promise<PostStocktakeResultDto> {
  const response = await api.post(`${STOCKTAKES_PATH}/${id}/post`, body);
  return response.data as PostStocktakeResultDto;
}

export async function cancelStocktake(id: number): Promise<StocktakeSummaryDto> {
  const response = await api.post(`${STOCKTAKES_PATH}/${id}/cancel`);
  return response.data as StocktakeSummaryDto;
}
