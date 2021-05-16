import cv2 as cv
import numpy as np


def vertical_lines_writer(image, min_space_length=5, split_of_mean=10, draw_parents=True):
    img = np.copy(image)
    img = cv.rotate(img, cv.ROTATE_90_CLOCKWISE)
    img = horizontal_lines_writer(img, min_space_length, split_of_mean)
    img = cv.rotate(img, cv.ROTATE_90_COUNTERCLOCKWISE)
    return img


def horizontal_lines_writer(image, min_space_length=5, split_of_mean=10, draw_parents=True):
    img = np.copy(image)
    ret, thresh = cv.threshold(img, 200, 255, cv.THRESH_BINARY_INV)
    rho = 1  # distance resolution in pixels of the Hough grid
    theta = np.pi / 2  # angular resolution in radians of the Hough grid
    threshold = 15  # minimum number of votes (intersections in Hough grid cell)
    min_line_length = 40  # minimum number of pixels making up a line
    max_line_gap = 2  # maximum gap in pixels between connectable line segments

    lines = cv.HoughLinesP(thresh, rho, theta, threshold, np.array([]),
                           min_line_length, max_line_gap)
    horizontal_lines = [0, img.shape[0]]
    for line in lines:
        for x1, y1, x2, y2 in line:
            if abs(y1 - y2) < 3:
                horizontal_lines.append(y1)
                if (draw_parents):
                    cv.line(img, (0, y1), (img.shape[1], y2), (0, 0, 0), 3)
    horizontal_lines.sort()
    sums = []

    for i in range(len(horizontal_lines) - 1):
        start = horizontal_lines[i]
        finish = horizontal_lines[i + 1]
        sums.append([])
        for j in range(img.shape[1] - min_space_length):
            sums[i].append(np.sum(thresh[start:finish, j:j + min_space_length]))
        numpysums = np.array(sums[i])
        for j in range(len(sums[i])):
            if (sums[i][j] > numpysums.mean() / split_of_mean):
                sums[i][j] = 1
            else:
                sums[i][j] = 0
        coordinates = []
        for j in range(len(sums[i]) - 1):
            if sums[i][j] != sums[i][j + 1]:
                coordinates.append(j)
                if len(coordinates) % 2 == 1 and len(coordinates) > 1:
                    cv.line(img, ((coordinates[-1] + coordinates[-2] + min_space_length) // 2, start),
                            ((coordinates[-1] + coordinates[-2] + min_space_length) // 2, finish), (0, 0, 0), 2)

    return img


img = cv.imread('table.png', cv.IMREAD_GRAYSCALE)
vertical = vertical_lines_writer(img, draw_parents=False)
horizontal = horizontal_lines_writer(img, draw_parents=False)
cv.imshow('vertical', vertical)
cv.imshow('horizontal', horizontal)
cv.imshow('both', cv.bitwise_not(cv.bitwise_or(cv.bitwise_not(vertical), cv.bitwise_not(horizontal))))
cv.waitKey()
