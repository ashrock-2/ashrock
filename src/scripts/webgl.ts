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

    /** 2. shader, program 초기화 */
    const vertexShaderContent = /** GLSL  */ `
        precision mediump float;

        attribute vec2 vertPosition;
        attribute vec3 vertColor;
        varying vec3 fragColor;

        void main()
        {
          fragColor = vertColor;
          gl_Position = vec4(vertPosition, 0, 1);
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

    gl.shaderSource(vertexShader, vertexShaderContent);
    gl.shaderSource(fragmentShader, fragmentShaderContent);

    /** 3. shader compile. (GPU가 해석할 수 있는 바이너리 형태로 변환) */
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

    /** 4. 삼각형 꼭짓점 좌표, 색상 초기화 및 버퍼에 바인딩 */
    /** ...[X,Y,R,G,B] */
    const vertex1 = [0, 1, 1, 0, 0];
    const vertex2 = [-0.5, -0.5, 0, 1, 0];
    const vertex3 = [0.5, -0.5, 0, 0, 1];

    const triangleVertices = [...vertex1, ...vertex2, ...vertex3];
    const triangleVertextBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertextBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(triangleVertices),
      gl.STATIC_DRAW,
    );

    const positionAttribLocation = gl.getAttribLocation(
      program,
      "vertPosition",
    );
    const colorAttribLocation = gl.getAttribLocation(program, "vertColor");
    gl.vertexAttribPointer(
      positionAttribLocation,
      2, // x, y
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribPointer(
      colorAttribLocation,
      3, // r,g, b
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT, // x, y를 건너 뛰어서 2
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

customElements.define("web-gl", WebGL);
