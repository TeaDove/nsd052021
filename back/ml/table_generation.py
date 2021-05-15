from typing import List, Tuple

import numpy as np

from models.tables import ImageTable, Table, Cell, ImageCell


def find_min_size(cells: List[ImageCell]) -> Tuple[int, int]:
    min_size = (1e10, 1e10)
    for cell in cells:
        if cell.size[0] <= min_size[0] and cell.size[1] <= min_size[1]:
            min_size = cell.size
    return min_size


def quantize_cells(cells: List[Cell], grid: List[Tuple[int, int]], min_size: Tuple[int, int]) -> List[Cell]:
    quantized_cells = []
    for cell in cells:

        # Quantize cell's coordinates

        coordinates = cell.coordinates
        min_distance = 1e10
        closest_grid_point = (0, 0)
        for grid_point in grid:
            distance = np.linalg.norm(np.array(coordinates) - np.array(grid_point[:-1]))
            if distance < min_distance:
                closest_grid_point = grid_point
                min_distance = distance
        new_cell = cell
        new_cell.coordinates = closest_grid_point

        # Quantize cell size

        size = cell.size
        size_0 = int(np.round(size[0] / min_size[0]))
        size_1 = int(np.round(size[1] / min_size[1]))

        new_cell.size = (size_0, size_1)

        quantized_cells.append(new_cell)

    return quantized_cells


def generate_table_from_image(image_table: ImageTable) -> Table:
    table: Table = Table()
    min_size = find_min_size(image_table.cells)
    image_size = image_table.image.shape[:2]
    grid = [(i, k) for i in range(0, image_size[1] + min_size[0], min_size[0])
            for k in range(0, image_size[0] + min_size[1], min_size[1])]
