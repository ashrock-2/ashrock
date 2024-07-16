import { glMatrix, mat4 } from "gl-matrix";

class Cube extends HTMLElement {
  constructor() {
    super();
    /** 1. canvas, gl 초기화 */
    const canvas: HTMLCanvasElement | null = this.querySelector("canvas");
    if (!canvas) {
      throw new Error("Canvas not exist");
    }

    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");

    if (!gl) {
      throw new Error("webGL not supported");
    }
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    /** 2. 쉐이더 소스 코드 작성 */
    const vertexShaderContent = /** GLSL  */ `
        precision mediump float;

        attribute vec3 vertPosition;
        attribute vec3 vertColor;
        varying vec3 fragColor;

        uniform mat4 mWorld;
        uniform mat4 mViewer;
        uniform mat4 mProjection;

        void main()
        {
          fragColor = vertColor;
          gl_Position = mProjection * mViewer * mWorld * vec4(vertPosition, 1);
        }
    `;
    const fragmentShaderContent = /** GLSL */ `
        precision mediump float;

        varying vec3 fragColor;
        void main()
        {
          gl_FragColor = vec4(fragColor, 1.0);
        }
      `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
      throw new Error("createShader or crateProgram Failed");
    }

    /** 3. 쉐이더 소스를 쉐이더 객체에 연결 */
    gl.shaderSource(vertexShader, vertexShaderContent);
    gl.shaderSource(fragmentShader, fragmentShaderContent);

    /** 4. shader compile. (GPU가 해석할 수 있는 바이너리 형태로 변환) */
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(
        "ERROR compiling vertex shader." + gl.getShaderInfoLog(vertexShader),
      );
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(
        "ERROR compiling fragment shader." +
          gl.getShaderInfoLog(fragmentShader),
      );
    }

    /** 5. 프로그램 객체에 쉐이더를 연결하고 검증 */
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("ERROR linking program" + gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      throw new Error(
        "ERROR validating program" + gl.getProgramInfoLog(program),
      );
    }

    /** 6. 사각형 꼭짓점 좌표. 두 개의 삼각형을 이어붙여 하나의 사각형으로 만듬.
    색상 초기화 및 버퍼에 바인딩 */
    const boxVertices = [
      // X, Y, Z           R, G, B
      // Top
      -1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

      -1.0, 1.0, 1.0, 0.1, 0.1, 0.1,

      1.0, 1.0, 1.0, 0.5, 0.5, 0.5,

      1.0, 1.0, -1.0, 0.9, 0.9, 0.9,

      // Left
      -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,

      -1.0, -1.0, 1.0, 0.1, 0.1, 0.1,

      -1.0, -1.0, -1.0, 0.5, 0.5, 0.5,

      -1.0, 1.0, -1.0, 0.9, 0.9, 0.9,

      // Right
      1.0, 1.0, 1.0, 0.5, 0.5, 0.5,

      1.0, -1.0, 1.0, 0.1, 0.1, 0.1,

      1.0, -1.0, -1.0, 0.5, 0.5, 0.5,

      1.0, 1.0, -1.0, 0.9, 0.9, 0.9,

      // Front
      1.0, 1.0, 1.0, 0.5, 0.5, 0.5,

      1.0, -1.0, 1.0, 0.1, 0.1, 0.1,

      -1.0, -1.0, 1.0, 0.5, 0.5, 0.5,

      -1.0, 1.0, 1.0, 0.9, 0.9, 0.9,

      // Back
      1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

      1.0, -1.0, -1.0, 0.1, 0.1, 0.1,

      -1.0, -1.0, -1.0, 0.5, 0.5, 0.5,

      -1.0, 1.0, -1.0, 0.9, 0.9, 0.9,

      // Bottom
      -1.0, -1.0, -1.0, 0.5, 0.5, 0.5,

      -1.0, -1.0, 1.0, 0.1, 0.1, 0.1,

      1.0, -1.0, 1.0, 0.5, 0.5, 0.5,

      1.0, -1.0, -1.0, 0.9, 0.9, 0.9,
    ];

    const boxIndices = [
      // Top
      0, 1, 2, 0, 2, 3,

      // Left
      5, 4, 6, 6, 4, 7,

      // Right
      8, 9, 10, 8, 10, 11,

      // Front
      13, 12, 14, 15, 14, 12,

      // Back
      16, 17, 18, 16, 18, 19,

      // Bottom
      21, 20, 22, 22, 20, 23,
    ];

    const boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(boxVertices),
      gl.STATIC_DRAW,
    );

    const boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(boxIndices),
      gl.STATIC_DRAW,
    );

    /** 7. 속성 포인터 설정 및 활성화 */
    const positionAttribLocation = gl.getAttribLocation(
      program,
      "vertPosition",
    );
    const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
      positionAttribLocation,
      3, // x, y, z
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribPointer(
      colorAttribLocation,
      3, // r,g,b
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT, // x, y, z를 건너 뛰어서 3
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.useProgram(program);
    /** 8. uniform 위치 가져오기 및 행렬 초기화 */
    const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    const matProjectionAttribLocation = gl.getUniformLocation(
      program,
      "mProjection",
    );
    const matViewerAttribLocation = gl.getUniformLocation(program, "mViewer");

    const projectionMatrix = mat4.perspective(
      new Float32Array(16),
      glMatrix.toRadian(45),
      canvas.width / canvas.height,
      0.1,
      1000.0,
    );
    const viewerMatrix = mat4.lookAt(
      new Float32Array(16),
      [0, 0, -5],
      [0, 0, 0],
      [0, 1, 0],
    );
    const worldMatrix = mat4.identity(new Float32Array(16));

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    gl.uniformMatrix4fv(matProjectionAttribLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(matViewerAttribLocation, false, viewerMatrix);

    const xRotationMatrix = new Float32Array(16);
    const yRotationMatrix = new Float32Array(16);

    /** 9. 렌더링 루프 설정 및 애니메이션 실행 */
    const identityMatrix = mat4.identity(new Float32Array(16));
    const loop = () => {
      const angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
      gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

      gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

customElements.define("gl-cube", Cube);
