export function rectsAreEqual(a: Rectangle, b: Rectangle) {
  return (
    a.bottomLeft.y === b.bottomLeft.y &&
    a.bottomLeft.x === b.bottomLeft.x &&
    a.bottomRight.y === b.bottomRight.y &&
    a.bottomRight.x === b.bottomRight.x &&
    a.topLeft.y === b.topLeft.y &&
    a.topLeft.x === b.topLeft.x &&
    a.topRight.y === b.topRight.y &&
    a.topRight.x === b.topRight.x
  );
}

export function rectangleSetFromArray(rects: Rectangle[]) {
  const seen: any = {};
  return rects.filter(rect => {
    const stringRepresentation = JSON.stringify(rect);
    return seen.hasOwnProperty(stringRepresentation)
      ? false
      : (seen[stringRepresentation] = true);
  });
}

function addEdgePoints(points: Point[], { width, height }: GridDimensions) {
  return points.concat([
    {
      x: 0,
      y: 0
    },
    {
      x: width,
      y: 0
    },
    {
      x: 0,
      y: height
    },
    {
      x: width,
      y: height
    }
  ]);
}

export function createRectangles(points: Point[]): Rectangle[] {
  const allRects = points.reduce((acc: Rectangle[], topLeft: Point) => {
    const rectangles = points.reduce((acc: Rectangle[], bottomRight) => {
      const topRight = points.reduce((acc: Point[], topRight) => {
        if (
          topRight.x === bottomRight.x &&
          topRight.y < bottomRight.y &&
          topRight.y === topLeft.y &&
          topRight.x > topLeft.x
        ) {
          return [...acc, topRight];
        }
        return acc;
      }, []);
      const bottomLeft = points.reduce((acc: Point[], bottomLeft) => {
        if (
          bottomLeft.y === bottomRight.y &&
          bottomLeft.x < bottomRight.x &&
          bottomLeft.x === topLeft.x &&
          bottomLeft.y > topLeft.y
        ) {
          return [...acc, bottomLeft];
        }
        return acc;
      }, []);
      if (bottomLeft.length > 0 && topRight.length > 0) {
        return [
          ...acc,
          ...bottomLeft.flatMap(bottomLeft =>
            topRight.map(topRight => {
              return { topRight, topLeft, bottomLeft, bottomRight };
            })
          )
        ];
      }
      return acc;
    }, []);
    if (rectangles.length > 0) {
      return [...acc, ...rectangles];
    }
    return acc;
  }, []);
  return removeRectanglesWithChildren(rectangleSetFromArray(allRects));
}

function findArea(rectangles: Rectangle[], col: number, row: number) {
  return rectangles.find(rect => {
    if (rect.bottomRight.x === col && rect.bottomRight.y === row) {
      return true;
    } else {
      return false;
    }
  });
}

export function findRectangleThatDirectlyContainsArea(
  rectangles: Rectangle[],
  col: number,
  row: number
) {
  const increasedRowArea = rectangles.find(rect => {
    if (
      rect.bottomRight.x === col &&
      rect.bottomRight.y >= row &&
      rect.topLeft.y <= row
    ) {
      return true;
    } else {
      return false;
    }
  });
  const increasedColArea = rectangles.find(rect => {
    if (
      rect.bottomRight.x >= col &&
      rect.bottomRight.y === row &&
      rect.topLeft.x <= col
    ) {
      return true;
    } else {
      return false;
    }
  });

  //  check with both increased only if no direct match is found.
  // It must mean, that this area is the product of columns and rows leaking into this area from others
  if (!increasedRowArea && !increasedColArea) {
    const enclosingArea = rectangles.find(rect => {
      if (
        rect.bottomRight.x >= col &&
        rect.bottomRight.y >= row &&
        rect.topLeft.x <= col &&
        rect.topLeft.y <= row
      ) {
        return true;
      } else {
        return false;
      }
    });
    return enclosingArea;
  } else {
    // now take the one where the topleft is to the left of the col
    // in this use case we can assume that there will be an area containing the one we are at now.
    // So one of the two finds above must return a result
    const result = [increasedColArea, increasedRowArea]
      .filter(area => area)
      .find(area => {
        return area!.topLeft.x < col;
      });
    return result;
  }
}

// TODO: fix the naming of rectangles and areas
// TODO: type area
export function assignAreasToGrid(
  rectangles: Rectangle[],
  columns: Column[],
  rows: Row[]
): any[][] {
  function sortByAttribute(attr: string) {
    return function sorter(a: any, b: any) {
      if (a[attr] < b[attr]) {
        return -1;
      }
      if (a[attr] > b[attr]) {
        return 1;
      }
      return 0;
    };
  }
  return rows.sort(sortByAttribute("y")).map(row => {
    const areasInRow = columns.sort(sortByAttribute("x")).map(col => {
      let area: any = findArea(rectangles, col.x, row.y);
      if (!area) {
        area = findRectangleThatDirectlyContainsArea(rectangles, col.x, row.y);
      }
      return area;
    });
    return areasInRow;
  });
}

export function getLineIntersectionPoints(lines: Line[]): Point[] {
  // simply take the constant variables of each line (x || y) and combine to get the correct point.
  // works since all lines a straight
  if (lines.length <= 1) {
    return [];
  }
  const baseLine = lines[0];
  const baseLineConstant =
    baseLine.start.x === baseLine.end.x
      ? { x: baseLine.start.x }
      : { y: baseLine.start.y };
  const linesWithoutBaseLine = lines.filter(
    line =>
      line.end.x !== baseLine.end.x ||
      line.end.y !== baseLine.end.y ||
      line.start.x !== baseLine.start.x ||
      line.start.y !== baseLine.start.y
  );
  return linesWithoutBaseLine
    .reduce((acc: Point[], line: Line) => {
      const lineConstant =
        line.start.x === line.end.x ? { x: line.start.x } : { y: line.start.y };
      if (baseLineConstant.x) {
        if (
          lineConstant.y &&
          lineConstant.y >= baseLine.start.y &&
          lineConstant.y <= baseLine.end.y &&
          (line.start.x === baseLineConstant.x ||
            (line.end.x === baseLineConstant.x ||
              (line.start.x < baseLineConstant.x &&
                line.end.x > baseLineConstant.x)))
        ) {
          return acc.concat([{ y: lineConstant.y, x: baseLineConstant.x }]);
        }
      } else {
        if (
          lineConstant.x &&
          lineConstant.x >= baseLine.start.x &&
          lineConstant.x <= baseLine.end.x &&
          (line.start.y === baseLineConstant.y ||
            line.end.y === baseLineConstant.y ||
            (line.start.y < baseLineConstant.y! &&
              line.end.y > baseLineConstant.y!))
        ) {
          return acc.concat([{ x: lineConstant.x, y: baseLineConstant.y! }]);
        }
      }
      return acc;
    }, [])
    .concat(getLineIntersectionPoints(linesWithoutBaseLine));
}

// only works when rectangles are unique!
export function removeRectanglesWithChildren(
  rectangles: Rectangle[]
): Rectangle[] {
  return rectangles.reduce((acc: Rectangle[], rect: Rectangle) => {
    const containedRect = rectangles.find(innerRect => {
      return (
        // just make sure that it is not the same rectangle
        (innerRect.bottomRight.x !== rect.bottomRight.x &&
          innerRect.bottomRight.y !== rect.bottomRight.y &&
          // if the topleft of another rectangle is contained inside this rectangle, than the rectangle is definetely contained inside this rectangle
          innerRect.topLeft.x > rect.topLeft.x &&
          innerRect.topLeft.y > rect.topLeft.y &&
          innerRect.topLeft.x < rect.topRight.x &&
          innerRect.topLeft.y < rect.bottomLeft.y) ||
        (innerRect.topLeft.x === rect.topLeft.x &&
          innerRect.topLeft.y === rect.topLeft.y &&
          (innerRect.topRight.x < rect.topRight.x ||
            innerRect.bottomLeft.y < rect.bottomLeft.y))
      );
    });
    if (!containedRect) {
      return [...acc, rect];
    }
    return acc;
  }, []);
}

export function generatePointsFromLines(
  lines: Line[],
  dimensions: GridDimensions
): Point[] {
  let points: Point[] = [];
  points = addEdgePoints(points, dimensions);
  lines.forEach(line => {
    points.push(line.start);
    points.push(line.end);
  });

  const interSections = getLineIntersectionPoints(lines);

  const seen: any = {};
  points = points.concat(interSections).filter(point => {
    const stringRepresentation = JSON.stringify(point);
    return seen.hasOwnProperty(stringRepresentation)
      ? false
      : (seen[stringRepresentation] = true);
  });
  return points;
}

export function generateRowsAndColumnsFromLine(
  lines: Line[],
  dimensions: GridDimensions
): { rows: Row[]; columns: Column[] } {
  let rowSet: Set<number> = new Set([]);
  let columnSet: Set<number> = new Set([]);
  lines.forEach(line => {
    if (line.end.x === line.start.x) {
      columnSet.add(line.end.x);
    } else {
      rowSet.add(line.end.y);
    }
  });
  rowSet.add(dimensions.height);
  columnSet.add(dimensions.width);
  let rows = Array.from(rowSet).reduce((acc: Row[], y: number) => {
    return [
      ...acc,
      {
        percentageOfGrid: (y / dimensions.height) * 100,
        y
      }
    ];
  }, []);

  let columns = Array.from(columnSet).reduce((acc: Column[], x: number) => {
    return [
      ...acc,
      {
        percentageOfGrid: (x / dimensions.width) * 100,
        x
      }
    ];
  }, []);
  return { columns, rows };
}

export function generateGridCss(lines: Line[], dimensions: GridDimensions) {
  let points: Point[] = generatePointsFromLines(lines, dimensions);
  const { rows, columns } = generateRowsAndColumnsFromLine(lines, dimensions);

  let rectangles = createRectangles(points);

  rectangles = rectangles.map((rect, index) => {
    return Object.assign({}, rect, { name: `area${index}` });
  });

  const grid = assignAreasToGrid(rectangles, columns, rows);

  function sortByAttribute(attr: string) {
    return function(a: any, b: any) {
      if (a[attr] > b[attr]) {
        return 1;
      }
      if (a[attr] < b[attr]) {
        return -1;
      }
      return 0;
    };
  }
  return {
    // create columns and rows
    // https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
    // and
    // https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows
    areas: grid.reduce((acc, row) => [...acc, ...row], []),
    ["grid-template-columns"]: columns.sort(sortByAttribute("x")).reduce(
      (acc, col: any) => ({
        result: `${acc.result} ${col.percentageOfGrid - acc.carry}% `,
        carry: col.percentageOfGrid
      }),
      { result: "", carry: 0 }
    ).result,
    ["grid-template-rows"]: rows.sort(sortByAttribute("y")).reduce(
      (acc, row: any) => ({
        result: `${acc.result} ${row.percentageOfGrid - acc.carry}% `,
        carry: row.percentageOfGrid
      }),
      { result: "", carry: 0 }
    ).result,
    display: "grid",
    ["grid-template-areas"]: grid.reduce((acc, next) => {
      const nextRowTemplate = next.reduce(
        (acc, area) => acc + " " + area.name,
        ""
      );
      return `${acc} "${nextRowTemplate}"`;
    }, "")
  };
}

export function getClosestGridLineFromPoint(
  point: Point,
  dimensions: GridDimensions,
  gridSpacing: GridSpacing
) {
  const { x, y } = point;
  const { width, height } = dimensions;

  const spacingWidthInPxls = width / gridSpacing.vertical;
  const spacingHeightInPxls = height / gridSpacing.horizontal;

  const distanceOfCursorToVerticalLine = x % spacingWidthInPxls;
  const distanceOfCursorToHorizontalLine = y % spacingHeightInPxls;

  if (distanceOfCursorToVerticalLine < distanceOfCursorToHorizontalLine) {
    const xCoordinateOfGridLine =
      Math.round(x / spacingWidthInPxls) * spacingWidthInPxls;
    const closestLine = {
      start: {
        x: xCoordinateOfGridLine + 4,
        y: 0
      },
      end: {
        x: xCoordinateOfGridLine + 4,
        y: height
      }
    };
    return closestLine;
  } else {
    const yCoordinateOfGridLine =
      Math.round(y / spacingHeightInPxls) * spacingHeightInPxls;

    const closestLine = {
      start: {
        x: 0,
        y: yCoordinateOfGridLine
      },
      end: {
        x: width,
        y: yCoordinateOfGridLine
      }
    };
    return closestLine;
  }
}

export function getPreviousCrossingOnYAxis(
  pointToSearchFor: Point,
  gridLines: Line[]
): Point {
  const lineInSameXRange = gridLines.filter(line => {
    return (
      line.start.x < pointToSearchFor.x &&
      line.end.x > pointToSearchFor.x &&
      line.start.y < pointToSearchFor.y
    );
  });

  let startingPoint = { x: pointToSearchFor.x, y: 0 };
  lineInSameXRange.forEach(line => {
    if (line.start.y > startingPoint.y) {
      startingPoint.y = line.start.y;
    }
  });
  return startingPoint;
}

export function getNextCrossingOnYAxis(
  pointToSearchFor: Point,
  gridLines: Line[],
  dimensions: GridDimensions
): Point {
  const { height } = dimensions;
  const lineInSameXRange = gridLines.filter(line => {
    return (
      line.start.x < pointToSearchFor.x &&
      line.end.x > pointToSearchFor.x &&
      line.start.y > pointToSearchFor.y
    );
  });

  let endPoint = { x: pointToSearchFor.x, y: height };

  lineInSameXRange.forEach(line => {
    if (line.start.y < endPoint.y) {
      endPoint.y = line.start.y;
    }
  });
  return endPoint;
}

export function getPreviousCrossingOnXAxis(
  pointToSearchFor: Point,
  gridLines: Line[]
): Point {
  const lineInSameXRange = gridLines.filter(line => {
    return (
      line.start.y < pointToSearchFor.y &&
      line.end.y > pointToSearchFor.y &&
      line.start.x < pointToSearchFor.x
    );
  });

  let startingPoint = { x: 0, y: pointToSearchFor.y };

  lineInSameXRange.forEach(line => {
    if (line.start.x > startingPoint.x) {
      startingPoint.x = line.start.x;
    }
  });
  return startingPoint;
}

export function getNextCrossingOnXAxis(
  pointToSearchFor: Point,
  gridLines: Line[],
  dimensions: GridDimensions
): Point {
  const { width } = dimensions;
  const lineInSameXRange = gridLines.filter(line => {
    return (
      line.start.y < pointToSearchFor.y &&
      line.end.y > pointToSearchFor.y &&
      line.start.x > pointToSearchFor.x
    );
  });
  let endPoint = { x: width, y: pointToSearchFor.y };

  lineInSameXRange.forEach(line => {
    if (line.start.x < endPoint.x) {
      endPoint.x = line.start.x;
    }
  });
  return endPoint;
}
