import test from "ava";
import {
  createRectangles,
  getPreviousCrossingOnYAxis,
  getNextCrossingOnYAxis,
  getPreviousCrossingOnXAxis,
  getNextCrossingOnXAxis,
  getLineIntersectionPoints,
  assignAreasToGrid,
  rectsAreEqual,
  removeRectanglesWithChildren,
  generatePointsFromLines,
  generateRowsAndColumnsFromLine
} from "./grid";

test("Compares rectangles for equality", t => {
  let a = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 100, y: 0 },
    bottomLeft: { x: 0, y: 100 },
    bottomRight: { x: 100, y: 100 }
  };
  let b = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 100, y: 0 },
    bottomLeft: { x: 0, y: 100 },
    bottomRight: { x: 100, y: 100 }
  };

  t.truthy(rectsAreEqual(a, b));
});

test("Correctly creates 4 equal rectangles", t => {
  const points = [
    { x: 50, y: 0 },
    { x: 50, y: 100 },
    { x: 50, y: 50 },
    { x: 0, y: 50 },
    { x: 100, y: 50 },
    { x: 0, y: 100 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 0 }
  ];
  const rectangles = createRectangles(points);

  t.is(4, rectangles.length);
  const expectedResult = [
    {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 50, y: 0 },
      bottomLeft: { x: 0, y: 50 },
      bottomRight: { x: 50, y: 50 }
    },
    {
      topLeft: { x: 0, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 50, y: 100 }
    },
    {
      topLeft: { x: 50, y: 0 },
      topRight: { x: 100, y: 0 },
      bottomLeft: { x: 50, y: 50 },
      bottomRight: { x: 100, y: 50 }
    },
    {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 100, y: 50 },
      bottomLeft: { x: 50, y: 100 },
      bottomRight: { x: 100, y: 100 }
    }
  ];
  rectangles.forEach(rect => {
    const foundMatch = expectedResult.find(resultRect =>
      rectsAreEqual(rect, resultRect)
    );
    t.truthy(foundMatch);
  });
});

test("Correctly creates a complex grid with subgrids", t => {
  const points = [
    {
      x: 10,
      y: 10
    },
    {
      x: 0,
      y: 10
    },
    {
      x: 10,
      y: 0
    },
    {
      x: 10,
      y: 50
    },
    {
      x: 40,
      y: 50
    },
    {
      x: 40,
      y: 0
    },
    {
      x: 50,
      y: 0
    },
    {
      x: 0,
      y: 50
    },
    {
      x: 50,
      y: 50
    },
    {
      x: 0,
      y: 0
    }
  ];

  const expectedResult = [
    {
      topRight: { x: 10, y: 10 },
      topLeft: { x: 0, y: 10 },
      bottomLeft: { x: 0, y: 50 },
      bottomRight: { x: 10, y: 50 }
    },
    {
      topRight: { x: 10, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 10 },
      bottomRight: { x: 10, y: 10 }
    },
    {
      topRight: { x: 40, y: 0 },
      topLeft: { x: 10, y: 0 },
      bottomLeft: { x: 10, y: 50 },
      bottomRight: { x: 40, y: 50 }
    },
    {
      topRight: { x: 50, y: 0 },
      topLeft: { x: 40, y: 0 },
      bottomLeft: { x: 40, y: 50 },
      bottomRight: { x: 50, y: 50 }
    }
  ];

  const rectangles = createRectangles(points);

  t.is(4, rectangles.length);
  rectangles.forEach(rect => {
    const foundMatch = expectedResult.find(resultRect =>
      rectsAreEqual(rect, resultRect)
    );
    t.truthy(foundMatch);
  });
});

test("Get next point where a line would be cross horizontally upwards", t => {
  let point = { x: 100, y: 50 };

  let line = {
    start: { x: 0, y: 30 },
    end: { x: 200, y: 30 }
  };
  let expectedPoint = { x: 100, y: 30 };

  t.deepEqual(getPreviousCrossingOnYAxis(point, [line]), expectedPoint);
});

test("Get 0 when a line from point does not cross horizontally upwards", t => {
  let point = { x: 100, y: 50 };

  let line = {
    start: { x: 0, y: 60 },
    end: { x: 200, y: 60 }
  };
  let expectedPoint = { x: 100, y: 0 };

  t.deepEqual(getPreviousCrossingOnYAxis(point, [line]), expectedPoint);
});

test("Get next point where a line would is crossed horizontally downwards", t => {
  let point = { x: 100, y: 10 };

  let line = {
    start: { x: 0, y: 30 },
    end: { x: 200, y: 30 }
  };
  let expectedPoint = { x: 100, y: 30 };

  t.deepEqual(
    getNextCrossingOnYAxis(point, [line], { width: 200, height: 200 }),
    expectedPoint
  );
});

test("Get height when a line from point does not cross horizontally downwards", t => {
  let point = { x: 100, y: 60 };

  let line = {
    start: { x: 0, y: 30 },
    end: { x: 200, y: 30 }
  };
  let expectedPoint = { x: 100, y: 200 };

  t.deepEqual(
    getNextCrossingOnYAxis(point, [line], { width: 200, height: 200 }),
    expectedPoint
  );
});

test("Get next point where a line would be crossed horizontally left", t => {
  let point = { x: 50, y: 30 };

  let line = {
    start: { x: 20, y: 0 },
    end: { x: 20, y: 200 }
  };
  let expectedPoint = { x: 20, y: 30 };

  t.deepEqual(getPreviousCrossingOnXAxis(point, [line]), expectedPoint);
});

test("Get 0 if no line is crossed horizontally left", t => {
  let point = { x: 10, y: 30 };

  let line = {
    start: { x: 20, y: 0 },
    end: { x: 20, y: 200 }
  };
  let expectedPoint = { x: 0, y: 30 };

  t.deepEqual(getPreviousCrossingOnXAxis(point, [line]), expectedPoint);
});

test("Get next point where a line would be crossed horizontally right", t => {
  let point = { x: 60, y: 50 };

  let line = {
    start: { x: 80, y: 0 },
    end: { x: 80, y: 200 }
  };
  let expectedPoint = { x: 80, y: 50 };

  t.deepEqual(
    getNextCrossingOnXAxis(point, [line], { width: 200, height: 200 }),
    expectedPoint
  );
});

test("Get width if no line is crossed horizontally right", t => {
  let point = { x: 60, y: 50 };

  let line = {
    start: { x: 30, y: 0 },
    end: { x: 30, y: 200 }
  };
  let expectedPoint = { x: 200, y: 50 };

  t.deepEqual(
    getNextCrossingOnXAxis(point, [line], { width: 200, height: 200 }),
    expectedPoint
  );
});

test("From an array of lines, all the points where lines intersect are returned", t => {
  let lines = [
    { start: { x: 0, y: 20 }, end: { x: 100, y: 20 } },
    { start: { x: 20, y: 0 }, end: { x: 20, y: 100 } }
  ];
  let expectedResult = [{ x: 20, y: 20 }];
  let result = getLineIntersectionPoints(lines);

  t.deepEqual(expectedResult, result);

  lines = [
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 } },
    { start: { x: 50, y: 0 }, end: { x: 50, y: 100 } },
    { start: { x: 0, y: 25 }, end: { x: 50, y: 25 } },
    { start: { x: 75, y: 50 }, end: { x: 75, y: 100 } }
  ];
  expectedResult = [{ x: 50, y: 50 }, { x: 75, y: 50 }, { x: 50, y: 25 }];

  result = getLineIntersectionPoints(lines);
  t.deepEqual(expectedResult, result);
});

test("Assigns the defined areas to the corresponding grid sections", t => {
  // somehow have a picture here?
  let rectangles = [
    {
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 50 },
      topRight: { x: 50, y: 0 },
      bottomRight: { x: 50, y: 50 },
      name: "area1"
    },
    {
      topLeft: { x: 0, y: 50 },
      bottomLeft: { x: 0, y: 100 },
      topRight: { x: 30, y: 0 },
      bottomRight: { x: 30, y: 100 },
      name: "area6"
    },
    {
      topLeft: { x: 30, y: 50 },
      bottomLeft: { x: 30, y: 100 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 100 },
      name: "area2"
    },
    {
      bottomRight: { x: 100, y: 50 },
      topRight: { x: 100, y: 0 },
      topLeft: { x: 50, y: 0 },
      bottomLeft: { x: 50, y: 50 },
      name: "area3"
    },
    {
      bottomRight: { x: 100, y: 80 },
      topRight: { x: 100, y: 50 },
      topLeft: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 80 },
      name: "area4"
    },
    {
      bottomRight: { x: 100, y: 100 },
      topRight: { x: 100, y: 80 },
      topLeft: { x: 50, y: 80 },
      bottomLeft: { x: 50, y: 100 },
      name: "area5"
    }
  ];

  let columns = [
    { x: 30, percentageOfGrid: 0 },
    { x: 50, percentageOfGrid: 0 },
    { x: 100, percentageOfGrid: 0 }
  ];
  let rows = [
    { y: 50, percentageOfGrid: 0 },
    { y: 80, percentageOfGrid: 0 },
    { y: 100, percentageOfGrid: 0 }
  ];
  let expectedResult = [
    [
      {
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 50 },
        topRight: { x: 50, y: 0 },
        bottomRight: { x: 50, y: 50 },
        name: "area1"
      },
      {
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 50 },
        topRight: { x: 50, y: 0 },
        bottomRight: { x: 50, y: 50 },
        name: "area1"
      },
      {
        bottomRight: { x: 100, y: 50 },
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        name: "area3"
      }
    ],
    [
      {
        topLeft: { x: 0, y: 50 },
        bottomLeft: { x: 0, y: 100 },
        topRight: { x: 30, y: 0 },
        bottomRight: { x: 30, y: 100 },
        name: "area6"
      },
      {
        topLeft: { x: 30, y: 50 },
        bottomLeft: { x: 30, y: 100 },
        topRight: { x: 50, y: 50 },
        bottomRight: { x: 50, y: 100 },
        name: "area2"
      },
      {
        bottomRight: { x: 100, y: 80 },
        topRight: { x: 100, y: 50 },
        topLeft: { x: 50, y: 50 },
        bottomLeft: { x: 50, y: 80 },
        name: "area4"
      }
    ],
    [
      {
        topLeft: { x: 0, y: 50 },
        bottomLeft: { x: 0, y: 100 },
        topRight: { x: 30, y: 0 },
        bottomRight: { x: 30, y: 100 },
        name: "area6"
      },
      {
        topLeft: { x: 30, y: 50 },
        bottomLeft: { x: 30, y: 100 },
        topRight: { x: 50, y: 50 },
        bottomRight: { x: 50, y: 100 },
        name: "area2"
      },
      {
        bottomRight: { x: 100, y: 100 },
        topRight: { x: 100, y: 80 },
        topLeft: { x: 50, y: 80 },
        bottomLeft: { x: 50, y: 100 },
        name: "area5"
      }
    ]
  ];

  let result = assignAreasToGrid(rectangles, columns, rows);

  t.deepEqual(result, expectedResult);
});

test("Remove rectangles that contain other rectangles", t => {
  const rectangles = [
    {
      bottomRight: { x: 100, y: 100 },
      topRight: { x: 100, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 100 }
    },
    {
      bottomRight: { x: 50, y: 50 },
      topRight: { x: 50, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 50 }
    }
  ];

  const result = removeRectanglesWithChildren(rectangles);

  const expectedResult = [
    {
      bottomRight: { x: 50, y: 50 },
      topRight: { x: 50, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 50 }
    }
  ];

  t.deepEqual(result, expectedResult);
});

test("From lines to grid with middle split and vertical subgrid", t => {
  // insert picture here
  const lines = [
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 } },
    { start: { x: 50, y: 0 }, end: { x: 50, y: 100 } },
    { start: { x: 25, y: 50 }, end: { x: 25, y: 100 } }
  ];

  const dimensions = { width: 100, height: 100 };

  const points = generatePointsFromLines(lines, dimensions);

  const rectangles = createRectangles(points);

  const { rows, columns } = generateRowsAndColumnsFromLine(lines, dimensions);

  const expectedRectangles = [
    {
      topRight: { x: 50, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 50 },
      bottomRight: { x: 50, y: 50 }
    },
    {
      topRight: { x: 100, y: 0 },
      topLeft: { x: 50, y: 0 },
      bottomLeft: { x: 50, y: 50 },
      bottomRight: { x: 100, y: 50 }
    },
    {
      topRight: { x: 100, y: 50 },
      topLeft: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 100 },
      bottomRight: { x: 100, y: 100 }
    },
    {
      topRight: { x: 50, y: 50 },
      topLeft: { x: 25, y: 50 },
      bottomLeft: { x: 25, y: 100 },
      bottomRight: { x: 50, y: 100 }
    },
    {
      topRight: { x: 25, y: 50 },
      topLeft: { x: 0, y: 50 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 25, y: 100 }
    }
  ];

  rectangles.forEach(rect => {
    const foundMatch = expectedRectangles.find(resultRect =>
      rectsAreEqual(rect, resultRect)
    );
    t.truthy(foundMatch);
  });

  const grid = assignAreasToGrid(rectangles, columns, rows);

  const expectedGrid = [
    [
      {
        topRight: { x: 50, y: 0 },
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 50 },
        bottomRight: { x: 50, y: 50 }
      },
      {
        topRight: { x: 50, y: 0 },
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 50 },
        bottomRight: { x: 50, y: 50 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      }
    ],
    [
      {
        topRight: { x: 25, y: 50 },
        topLeft: { x: 0, y: 50 },
        bottomLeft: { x: 0, y: 100 },
        bottomRight: { x: 25, y: 100 }
      },
      {
        topRight: { x: 50, y: 50 },
        topLeft: { x: 25, y: 50 },
        bottomLeft: { x: 25, y: 100 },
        bottomRight: { x: 50, y: 100 }
      },
      {
        topRight: { x: 100, y: 50 },
        topLeft: { x: 50, y: 50 },
        bottomLeft: { x: 50, y: 100 },
        bottomRight: { x: 100, y: 100 }
      }
    ]
  ];

  t.deepEqual(expectedGrid, grid);
});

test("From lines to grid with middle split and horizontal subgrid", t => {
  // insert picture here
  const lines = [
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 } },
    { start: { x: 50, y: 0 }, end: { x: 50, y: 100 } },
    { start: { x: 0, y: 25 }, end: { x: 50, y: 25 } }
  ];

  const dimensions = { width: 100, height: 100 };

  const points = generatePointsFromLines(lines, dimensions);

  const rectangles = createRectangles(points);

  const { rows, columns } = generateRowsAndColumnsFromLine(lines, dimensions);

  const expectedRectangles = [
    {
      topRight: { x: 50, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 25 },
      bottomRight: { x: 50, y: 25 }
    },
    {
      topRight: { x: 50, y: 25 },
      topLeft: { x: 0, y: 25 },
      bottomLeft: { x: 0, y: 50 },
      bottomRight: { x: 50, y: 50 }
    },
    {
      topRight: { x: 100, y: 0 },
      topLeft: { x: 50, y: 0 },
      bottomLeft: { x: 50, y: 50 },
      bottomRight: { x: 100, y: 50 }
    },
    {
      topRight: { x: 100, y: 50 },
      topLeft: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 100 },
      bottomRight: { x: 100, y: 100 }
    },
    {
      topRight: { x: 50, y: 50 },
      topLeft: { x: 0, y: 50 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 50, y: 100 }
    }
  ];

  rectangles.forEach(rect => {
    const foundMatch = expectedRectangles.find(resultRect =>
      rectsAreEqual(rect, resultRect)
    );
    t.truthy(foundMatch);
  });

  const grid = assignAreasToGrid(rectangles, columns, rows);

  const expectedGrid = [
    [
      {
        topRight: { x: 50, y: 0 },
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 25 },
        bottomRight: { x: 50, y: 25 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      }
    ],
    [
      {
        topRight: { x: 50, y: 25 },
        topLeft: { x: 0, y: 25 },
        bottomLeft: { x: 0, y: 50 },
        bottomRight: { x: 50, y: 50 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      }
    ],
    [
      {
        topRight: { x: 50, y: 50 },
        topLeft: { x: 0, y: 50 },
        bottomLeft: { x: 0, y: 100 },
        bottomRight: { x: 50, y: 100 }
      },
      {
        topRight: { x: 100, y: 50 },
        topLeft: { x: 50, y: 50 },
        bottomLeft: { x: 50, y: 100 },
        bottomRight: { x: 100, y: 100 }
      }
    ]
  ];

  t.deepEqual(expectedGrid, grid);
});

test("From lines to grid with middle split and horizontal + vertical subgrid", t => {
  // insert picture here
  const lines = [
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 } },
    { start: { x: 50, y: 0 }, end: { x: 50, y: 100 } },
    { start: { x: 0, y: 25 }, end: { x: 50, y: 25 } },
    { start: { x: 75, y: 50 }, end: { x: 75, y: 100 } }
  ];

  debugger;

  const dimensions = { width: 100, height: 100 };

  const points = generatePointsFromLines(lines, dimensions);

  const rectangles = createRectangles(points);

  const { rows, columns } = generateRowsAndColumnsFromLine(lines, dimensions);

  const expectedRectangles = [
    {
      topRight: { x: 50, y: 0 },
      topLeft: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 25 },
      bottomRight: { x: 50, y: 25 }
    },
    {
      topRight: { x: 50, y: 25 },
      topLeft: { x: 0, y: 25 },
      bottomLeft: { x: 0, y: 50 },
      bottomRight: { x: 50, y: 50 }
    },
    {
      topRight: { x: 100, y: 0 },
      topLeft: { x: 50, y: 0 },
      bottomLeft: { x: 50, y: 50 },
      bottomRight: { x: 100, y: 50 }
    },
    {
      topRight: { x: 100, y: 50 },
      topLeft: { x: 75, y: 50 },
      bottomLeft: { x: 75, y: 100 },
      bottomRight: { x: 100, y: 100 }
    },
    {
      topRight: { x: 75, y: 50 },
      topLeft: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 100 },
      bottomRight: { x: 75, y: 100 }
    },
    {
      topRight: { x: 50, y: 50 },
      topLeft: { x: 0, y: 50 },
      bottomLeft: { x: 0, y: 100 },
      bottomRight: { x: 50, y: 100 }
    }
  ];
  rectangles.forEach(rect => {
    const foundMatch = expectedRectangles.find(resultRect =>
      rectsAreEqual(rect, resultRect)
    );
    t.truthy(foundMatch);
  });

  const grid = assignAreasToGrid(rectangles, columns, rows);

  const expectedGrid = [
    [
      {
        topRight: { x: 50, y: 0 },
        topLeft: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 25 },
        bottomRight: { x: 50, y: 25 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      }
    ],
    [
      {
        topRight: { x: 50, y: 25 },
        topLeft: { x: 0, y: 25 },
        bottomLeft: { x: 0, y: 50 },
        bottomRight: { x: 50, y: 50 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      },
      {
        topRight: { x: 100, y: 0 },
        topLeft: { x: 50, y: 0 },
        bottomLeft: { x: 50, y: 50 },
        bottomRight: { x: 100, y: 50 }
      }
    ],
    [
      {
        topRight: { x: 50, y: 50 },
        topLeft: { x: 0, y: 50 },
        bottomLeft: { x: 0, y: 100 },
        bottomRight: { x: 50, y: 100 }
      },
      {
        topRight: { x: 75, y: 50 },
        topLeft: { x: 50, y: 50 },
        bottomLeft: { x: 50, y: 100 },
        bottomRight: { x: 75, y: 100 }
      },
      {
        topRight: { x: 100, y: 50 },
        topLeft: { x: 75, y: 50 },
        bottomLeft: { x: 75, y: 100 },
        bottomRight: { x: 100, y: 100 }
      }
    ]
  ];

  t.deepEqual(expectedGrid, grid);
});

test("From lines to grid with middle split and horizontal + vertical subgrid, with three rows", t => {
  const lines = [
    { start: { x: 0, y: 20 }, end: { x: 100, y: 20 } },
    { start: { x: 0, y: 50 }, end: { x: 100, y: 50 } },
    { start: { x: 20, y: 0 }, end: { x: 20, y: 100 } },
    { start: { x: 70, y: 20 }, end: { x: 70, y: 50 } },
    { start: { x: 40, y: 50 }, end: { x: 40, y: 100 } },
    { start: { x: 60, y: 50 }, end: { x: 60, y: 100 } }
  ];

  const dimensions = { width: 100, height: 100 };

  const points = generatePointsFromLines(lines, dimensions);

  const expectedPoints: Point[] = [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 100, y: 0 },
    { x: 0, y: 20 },
    { x: 20, y: 20 },
    { x: 70, y: 20 },
    { x: 100, y: 20 },
    { x: 0, y: 50 },
    { x: 20, y: 50 },
    { x: 40, y: 50 },
    { x: 60, y: 50 },
    { x: 70, y: 50 },
    { x: 100, y: 50 },
    { x: 0, y: 100 },
    { x: 20, y: 100 },
    { x: 40, y: 100 },
    { x: 60, y: 100 },
    { x: 100, y: 100 }
  ];

  expectedPoints.forEach(expectedPoint => {
    const foundMatch = points.find(
      point => point.x === expectedPoint.x && point.y === expectedPoint.y
    );
    t.truthy(foundMatch);
  });
});
