import * as glMatrix from "gl-matrix";

class Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(_x: number, _y: number, _width: number, _height: number) {
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
  }

  getCenter(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  getTopLeft(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(this.x, this.y);
  }
  getTopRight(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(this.x + this.width, this.y);
  }
  getBottomLeft(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(this.x, this.y + this.height);
  }
  getBottomRight(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(this.x + this.width, this.y + this.height);
  }
  getBottomCenter(): glMatrix.vec2 {
    return glMatrix.vec2.fromValues(
      this.x + this.width / 2,
      this.y + this.height
    );
  }

  scaleFromPoint(x: number, y: number, scale: number): Rect {
    const topLeft = this.getTopLeft();
    const bottomRight = this.getBottomRight();

    // Scale relative to the point (x, y)
    const newTopLeft = GeometryHelpers.scaleRelativeToPoint(
      topLeft[0],
      topLeft[1],
      x,
      y,
      scale,
      scale
    );
    const newBottomRight = GeometryHelpers.scaleRelativeToPoint(
      bottomRight[0],
      bottomRight[1],
      x,
      y,
      scale,
      scale
    );

    // Calculate new width and height
    const newX = newTopLeft[0];
    const newY = newTopLeft[1];
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];

    // Return the new rectangle
    return new Rect(newX, newY, newWidth, newHeight);
  }

  static fromBottomRight(x: number, y: number, width: number, height: number) {
    return new Rect(x - width, y - height, width, height);
  }

  static lerpRects(rect1: Rect, rect2: Rect, t: number): Rect {
    return new Rect(
      GeometryHelpers.lerp(rect1.x, rect2.x, t),
      GeometryHelpers.lerp(rect1.y, rect2.y, t),
      GeometryHelpers.lerp(rect1.width, rect2.width, t),
      GeometryHelpers.lerp(rect1.height, rect2.height, t)
    );
  }
}

class GeometryHelpers {
  static rotateAroundPoint(
    x: number,
    y: number,
    originX: number,
    originY: number,
    theta: number
  ): glMatrix.vec2 {
    // Create a translation matrix to move the origin to (xO, yO)

    const combinedMatrix = glMatrix.mat3.create();

    glMatrix.mat3.multiply(
      combinedMatrix,
      glMatrix.mat3.fromTranslation(
        glMatrix.mat3.create(),
        glMatrix.vec2.fromValues(originX, originY)
      ),
      glMatrix.mat3.fromRotation(glMatrix.mat3.create(), theta)
    );
    glMatrix.mat3.multiply(
      combinedMatrix,
      combinedMatrix,
      glMatrix.mat3.fromTranslation(
        glMatrix.mat3.create(),
        glMatrix.vec2.fromValues(-originX, -originY)
      )
    );

    // Create the point vector
    let point = glMatrix.vec2.fromValues(x, y);

    // Transform the point using the combined transformation matrix
    let result = glMatrix.vec2.create();
    glMatrix.vec2.transformMat3(result, point, combinedMatrix);

    return result;
  }
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static scaleRelativeToPoint(
    x: number,
    y: number,
    originX: number,
    originY: number,
    scaleX: number,
    scaleY: number
  ): glMatrix.vec2 {
    // Combine the transformations: T * S * T^-1
    let combinedMatrix = glMatrix.mat3.create();

    glMatrix.mat3.multiply(
      combinedMatrix,
      glMatrix.mat3.fromTranslation(
        glMatrix.mat3.create(),
        glMatrix.vec2.fromValues(originX, originY)
      ),
      glMatrix.mat3.fromScaling(
        glMatrix.mat3.create(),
        glMatrix.vec2.fromValues(scaleX, scaleY)
      )
    );
    glMatrix.mat3.multiply(
      combinedMatrix,
      combinedMatrix,
      glMatrix.mat3.fromTranslation(
        glMatrix.mat3.create(),
        glMatrix.vec2.fromValues(-originX, -originY)
      )
    );

    let point = glMatrix.vec2.fromValues(x, y);

    // Transform the point using the combined transformation matrix
    let result = glMatrix.vec2.create();
    glMatrix.vec2.transformMat3(result, point, combinedMatrix);

    return result;
  }

  static calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
}

export { GeometryHelpers, Rect };
