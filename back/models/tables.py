import json
from typing import Tuple, Any, List, Dict

import numpy as np


class Cell:
    id: int
    coordinates: Tuple[int, int]  # (y, x)
    size: Tuple[int, int]  # (x, y)
    content: Any

    def __lt__(self, other):
        if self.coordinates[0] == other.coordinates[0]:
            return self.coordinates[1] < other.coordinates[1]
        else:
            return self.coordinates[0] < other.coordinates[0]

    def __dict__(self):
        return {"data": self.content, "span": self.size}


class Table:
    cells: List[Cell]
    dimensions: Tuple[int, int]
    grid: List[Tuple[int, int]]

    def fill_table(self):
        cell_coords = [cell.size for cell in self.cells]
        for grid_point in self.grid:
            if grid_point not in cell_coords:
                new_cell = Cell()
                new_cell.coordinates = grid_point
                new_cell.size = (1, 1)
                new_cell.content = None

                self.cells.append(new_cell)

    def sort_table(self):
        self.cells = sorted(self.cells)

    def gen_rows(self):
        return np.reshape(self.cells, self.dimensions)

    def __dict__(self):
        return [row for row in self.gen_rows()]

    def __str__(self):
        return json.dumps(self.__dict__)


class ImageCell(Cell):
    pass


class ImageTable:
    image: np.array
    cells: List[ImageCell]

    def get_cell_roi(self, cell: ImageCell = None, cell_id: int = None) -> np.array:
        if cell_id is not None:
            cell = self.cells[cell_id]
        if cell is not None:
            coordinates = cell.coordinates
            size = cell.size
            roi = image[coordinates[0]:size[1], coordinates[1]:size[0]]
            return roi
        else:
            return np.zeros(1)


class TesseractTable:
    cells: List[Cell]

    def __init__(self, data: List[Dict]):
        for data_cell in data:
            coordinates = (data_cell["y"], data_cell["x"])
            size = (data_cell["w"], data_cell["h"])
            content = data_cell["text"]

            new_cell = Cell()
            new_cell.coordinates = coordinates
            new_cell.size = size
            new_cell.content = content

            self.cells.append(new_cell)
