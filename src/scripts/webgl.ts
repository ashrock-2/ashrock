import { glMatrix, mat4 } from "gl-matrix";

class WebGL extends HTMLElement {
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

    canvas.width = 300;
    canvas.height = 300;

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

    /** 6. 삼각형 꼭짓점 좌표, 색상 초기화 및 버퍼에 바인딩 */
    /** ...[X,Y,Z,R,G,B] */
    const vertex1 = [0, 1, 0, 0, 0, 0];
    const vertex2 = [-0.5, -0.5, 0, 1, 1, 1];
    const vertex3 = [0.5, -0.5, 0, 0.5, 0.5, 0.5];
    const triangleVertices = [...vertex1, ...vertex2, ...vertex3];

    const triangleVertextBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertextBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(triangleVertices),
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
      [0, 0, -3],
      [0, 0, 0],
      [0, 1, 0],
    );
    const worldMatrix = mat4.identity(new Float32Array(16));

    gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);
    gl.uniformMatrix4fv(matProjectionAttribLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(matViewerAttribLocation, false, viewerMatrix);

    /** 9. 렌더링 루프 설정 및 애니메이션 실행 */
    const identityMatrix = mat4.identity(new Float32Array(16));
    const loop = () => {
      const angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
      mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
      gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

customElements.define("web-gl", WebGL);
