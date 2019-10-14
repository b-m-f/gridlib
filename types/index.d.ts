type Point = {
  x: number;
  y: number;
};

type Line = {
  start: Point;
  end: Point;
};

type Rectangle = {
  topLeft: Point;
  bottomLeft: Point;
  topRight: Point;
  bottomRight: Point;
};

type GridDimensions = {
  width: number;
  height: number;
};

type GridSpacing = {
  vertical: number;
  horizontal: number;
};

type Row = {
  y: number;
  percentageOfGrid: number;
};
type Column = {
  x: number;
  percentageOfGrid: number;
};
