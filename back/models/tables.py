import json
from typing import Tuple, Any, List, Dict

import numpy as np


class Cell:
    id: int
    coordinates: Tuple[int, int]  # (y, x)
    size: Tuple[int, int]  # (x, y)
    content: Any

    def __lt__(self, other):
        if self.coordinates[1] == other.coordinates[1]:
            return self.coordinates[0] < other.coordinates[0]
        else:
            return self.coordinates[1] < other.coordinates[1]

    def __repr__(self):
        return json.dumps(self.__dict__())

    def __dict__(self):
        return {"data": self.content, "span": self.size}


class Table:
    cells: List[Cell]
    dimensions: Tuple[int, int]
    rows: List[Cell]

    def fill_table(self):
        cell_coords = [cell.coordinates for cell in self.cells]
        grid = [(i, k) for i in range(self.dimensions[0]) for k in range(self.dimensions[1])]
        for grid_point in grid:
            if grid_point not in cell_coords:
                new_cell = Cell()
                new_cell.coordinates = grid_point
                new_cell.size = (0, 0)
                new_cell.content = None

                self.cells.append(new_cell)
        new_cells = []
        flag = True
        for cell in self.cells:
            if (
                    cell.coordinates[0] >= self.dimensions[0]
                    or cell.coordinates[1] >= self.dimensions[1]
            ):
                continue
            for new_cell in new_cells:
                if cell.coordinates == new_cell.coordinates:
                    flag = False
                    break
            if flag:
                new_cells.append(cell)
            flag = True
        self.cells = new_cells

    def sort_table(self):
        self.cells = sorted(self.cells)

    def gen_rows(self):
        self.rows = np.reshape(
            np.array([cell.__dict__() for cell in self.cells]), self.dimensions
        ).tolist()

    def __repr__(self):
        return json.dumps(self.rows)


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
            roi = image[coordinates[0]: size[1], coordinates[1]: size[0]]
            return roi
        else:
            return np.zeros(1)


class TesseractTable:
    cells: List[Cell]

    def __init__(self, content: List[Dict]):
        self.cells = []
        for data_cell in content:
            coordinates = (data_cell["y"], data_cell["x"])
            size = (data_cell["w"], data_cell["h"])
            content = data_cell["text"]

            new_cell = Cell()
            new_cell.coordinates = coordinates
            new_cell.size = size
            new_cell.content = content

            self.cells.append(new_cell)
