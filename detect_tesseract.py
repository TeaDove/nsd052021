from __future__ import print_function
import pytesseract
import cv2
from PIL import Image
import io
import numpy as np
import re
from imutils import contours
try:
    import urllib.request as urllib
except ModuleNotFoundError:
    import urllib

def imgread(im):
    try:
        image = Image.open(io.BytesIO(urllib.urlopen(im).read()))
    except ValueError:
        try:
            image = Image.open(im)
        except FileExistsError:
            return None
    try:
        image = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)
    except:
        return None
    return image


def find_table(image):
    im = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    dst = cv2.adaptiveThreshold(~im, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, -2)

    horizontal = dst.copy()
    vertical = dst.copy()
    scale = 15

    horizontalsize = horizontal.shape[1] // scale
    horizontalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (horizontalsize, 1))
    horizontal = cv2.erode(horizontal, horizontalStructure, (-1, -1))
    horizontal = cv2.dilate(horizontal, horizontalStructure, (-1, -1))

    verticalsize = vertical.shape[0] // scale
    verticalStructure = cv2.getStructuringElement(cv2.MORPH_RECT, (1, verticalsize))
    vertical = cv2.erode(vertical, verticalStructure, (-1, -1))
    vertical = cv2.dilate(vertical, verticalStructure, (-1, -1))

    table = horizontal + vertical

    return table

def find_cnts(image, table):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    cnts = cv2.findContours(opening, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]

    close = 255 - cv2.morphologyEx(table, cv2.MORPH_CLOSE, kernel, iterations=1)
    cnts = cv2.findContours(close, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    (cnts, _) = contours.sort_contours(cnts, method="top-to-bottom")

    return cnts

def get_text(path_to_image):
    image = imgread(path_to_image)
    table_text = []

    original = image.copy()
    table = find_table(image)
    cnts = find_cnts(image, table)
    for c in cnts:
        area = cv2.contourArea(c)
        if area < 25000:
            x,y,w,h = cv2.boundingRect(c)
            
            cv2.rectangle(image, (x, y), (x + w, y + h), (36,255,12))
            ROI = original[y:y+h, x:x+w]
            ROI = cv2.resize(ROI, (w * 2, h * 2))
            # extractedInformation = pytesseract.image_to_string(ROI, config='--psm 6 --oem 1', lang='rus')
            text1 = pytesseract.image_to_string(ROI, lang="rus", config='--psm 6')
            text2 = pytesseract.image_to_string(ROI, lang="rus", config='')
            text3 = pytesseract.image_to_string(ROI, lang="rus", config='--psm 7')

            text1 = text1.replace("\n", " ")
            text2 = text2.replace("\n", " ")
            text3 = text3.replace("\n", " ")

            text1 = re.sub(' *[^ \(\)А-Яа-я\d\w\/\\\.\-,:; ]+ *', ' ', text1)
            text2 = re.sub(' *[^ \(\)А-Яа-я\d\w\/\\\.\-,:; ]+ *', ' ', text2)
            text3 = re.sub(' *[^ \(\)А-Яа-я\d\w\/\\\.\-,:; ]+ *', ' ', text3)

            while text1.find('  ')!=-1:
                text1 = text1.replace('  ',' ')
            while text2.find('  ') != -1:
                text2 = text2.replace('  ', ' ')
            while text3.find('  ') != -1:
                text3 = text3.replace('  ', ' ')
            
            text1 = text1.strip()
            text2 = text2.strip()
            text3 = text3.strip()
            
            if text1 == text2 and text2==text3:
                text = text1
            elif (text1 == text2 or text1 == text3) and len(text1) > 2:
                text = text1
            elif text2 == text3 and len(text2) > 2:
                text = text2
            elif text3!='' and re.sub(' *[^ \-\d\.,]+ *', '', text3) == text3 and (len(text1) + len(text2))/2*0.4<len(text3) :
                text = text3
            elif text3!='' and len(text1) <= 2 and len(text2) <= 2:
                text = ''
            elif len(text1)>=len(text2) and len(text1)>2:
                text = text1
            elif len(text2) >= len(text1) and len(text2)> 2:
                text = text2
            else:
                text = ''
            table_text.append({
                "x": x,
                "y": y,
                "w": w,
                "h": h,
                "text": text
            })
            
    return table_text

# get_text('test_2.png')

