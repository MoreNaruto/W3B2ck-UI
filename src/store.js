import Vue from "vue";
import Vuex from "vuex";
import {
  Scene,
  TrackballControls,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  FogExp2,
  CylinderBufferGeometry,
  MeshPhongMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  LineBasicMaterial,
  LineDashedMaterial,
  Geometry,
  Vector3,
  Vector4,
  Line,
} from "three-full";
import json from "./assets/sample.json";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    width: 0,
    height: 0,
    camera: null,
    controls: null,
    scene: null,
    renderer: null,
    axisLines: [],
    pyramids: [],
  },

  getters: {
    CAMERA_POSITION: (state) => {
      return state.camera ? state.camera.position : null;
    },
  },

  mutations: {
    SET_VIEWPORT_SIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
    },

    INITIALIZE_RENDERER(state, el) {
      state.renderer = new WebGLRenderer({ antialias: true });
      state.renderer.setPixelRatio(window.devicePixelRatio);
      state.renderer.setSize(state.width, state.height);
      el.appendChild(state.renderer.domElement);
    },

    INITIALIZE_CAMERA(state) {
      state.camera = new PerspectiveCamera(
        // 1. Field of View (degrees)
        60,
        // 2. Aspect ratio
        state.width / state.height,
        // 3. Near clipping plane
        1,
        // 4. Far clipping plane
        1000
      );
      state.camera.position.z = 50;
    },

    INITIALIZE_CONTROLS(state) {
      state.controls = new TrackballControls(
        state.camera,
        state.renderer.domElement
      );
      state.controls.rotateSpeed = 1.0;
      state.controls.zoomSpeed = 1.2;
      state.controls.panSpeed = 0.8;
      state.controls.noZoom = false;
      state.controls.noPan = false;
      state.controls.staticMoving = true;
      state.controls.dynamicDampingFactor = 0.3;
      state.controls.keys = [65, 83, 68];
    },

    UPDATE_CONTROLS(state) {
      state.controls.update();
    },

    INITIALIZE_SCENE(state, plotPoints) {
      state.scene = new Scene();
      state.scene.background = new Color(0xcccccc);
      state.scene.fog = new FogExp2(0xcccccc, 0.002);

      var geometry = new CylinderBufferGeometry(0, 10, 30, 4, 1);
      var material = new MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      });

      var linePlotPoints = new LineBasicMaterial({
        color: 0x000000,
        linewidth: 10,
      });
      var geometry = new Geometry();
      for (var i = 0; i < plotPoints.length; i++) {
        const plotPoint = plotPoints[i]
        geometry.vertices.push(
          new Vector3(plotPoint.px, plotPoint.py, plotPoint.pz)
        );
      }
      var line = new Line(geometry, linePlotPoints);
      state.pyramids.push(line);
      state.scene.add(...state.pyramids);

      // lights
      var lightA = new DirectionalLight(0xffffff);
      lightA.position.set(1, 1, 1);
      state.scene.add(lightA);
      var lightB = new DirectionalLight(0x002288);
      lightB.position.set(-1, -1, -1);
      state.scene.add(lightB);
      var lightC = new AmbientLight(0x222222);
      state.scene.add(lightC);

      // Axis Line 1 (blue)
      var linePlotPoints = new LineDashedMaterial({
        color: 0x0000ff,
        linewidth: 10,
        dashSize: 10,
        gapSize: 10,
      });
      var geometry = new Geometry();
      geometry.vertices.push(new Vector3(0, 0, 0));
      geometry.vertices.push(new Vector3(0, 100, 0));
      var lineA = new Line(geometry, linePlotPoints);
      state.axisLines.push(lineA);

      // Axis Line 2 (Green)
      var materialC = new LineDashedMaterial({
        color: 0x00ff00,
        linewidth: 10,
        dashSize: 10,
        gapSize: 10,
      });
      var geometryC = new Geometry();
      geometryC.vertices.push(new Vector3(0, 0, 0));
      geometryC.vertices.push(new Vector3(100, 0, 0));
      var lineB = new Line(geometryC, materialC);
      state.axisLines.push(lineB);

      // Axis Line 3 (Red)
      var materialD = new LineDashedMaterial({
        color: 0xff0000,
        linewidth: 10,
        dashSize: 10,
        gapSize: 10,
      });
      var geometryD = new Geometry();
      geometryD.vertices.push(new Vector3(0, 0, 0));
      geometryD.vertices.push(new Vector3(0, 0, 100));
      var lineC = new Line(geometryD, materialD);
      state.axisLines.push(lineC);

      state.scene.add(...state.axisLines);
    },

    RESIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(width, height);
      state.controls.handleResize();
      state.renderer.render(state.scene, state.camera);
    },

    SET_CAMERA_POSITION(state, { x, y, z }) {
      if (state.camera) {
        state.camera.position.set(x, y, z);
      }
    },

    RESET_CAMERA_ROTATION(state) {
      if (state.camera) {
        state.camera.rotation.set(0, 0, 0);
        state.camera.quaternion.set(0, 0, 0, 1);
        state.camera.up.set(0, 1, 0);
        state.controls.target.set(0, 0, 0);
      }
    },

    HIDE_AXIS_LINES(state) {
      state.scene.remove(...state.axisLines);
      state.renderer.render(state.scene, state.camera);
    },

    SHOW_AXIS_LINES(state) {
      state.scene.add(...state.axisLines);
      state.renderer.render(state.scene, state.camera);
    },

    HIDE_PYRAMIDS(state) {
      state.scene.remove(...state.pyramids);
      state.renderer.render(state.scene, state.camera);
    },

    SHOW_PYRAMIDS(state) {
      state.scene.add(...state.pyramids);
      state.renderer.render(state.scene, state.camera);
    },
  },

  actions: {
    INIT({ state, commit }, { width, height, el }) {
      return new Promise((resolve) => {
        commit("SET_VIEWPORT_SIZE", { width, height });
        commit("INITIALIZE_RENDERER", el);
        commit("INITIALIZE_CAMERA");
        commit("INITIALIZE_CONTROLS");
        commit("INITIALIZE_SCENE", json);

        // Initial scene rendering
        state.renderer.render(state.scene, state.camera);

        // Add an event listener that will re-render
        // the scene when the controls are changed
        state.controls.addEventListener("change", () => {
          state.renderer.render(state.scene, state.camera);
        });

        resolve();
      });
    },
    ANIMATE({ state, dispatch }) {
      window.requestAnimationFrame(() => {
        dispatch("ANIMATE");
        state.controls.update();
      });
    },
  },
});
