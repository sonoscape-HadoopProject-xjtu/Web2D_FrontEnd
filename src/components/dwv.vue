<template>
  <div id="dwv">
    <md-progress-bar md-mode="determinate" :md-value="loadProgress"></md-progress-bar>
    <div class="layerContainer">
      <div class="dropBox">
        <p id="notice">图像未加载</p>
      </div>
      <canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
      <div class="drawDiv"></div>
    </div>
    <input type="range" id="scrollRange" value="0">
    <div class="button-row">
      <!-- action buttons -->
      <md-menu md-size="medium" md-align-trigger>
        <md-button class="md-raised md-primary" md-menu-trigger :disabled="!dataLoaded">
          {{ selectedTool }}
          <md-icon>arrow_drop_down</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item v-for="tool in tools" :key="tool" v-on:click="onChangeTool(tool)">{{ tool }}</md-menu-item>
        </md-menu-content>
      </md-menu>
      <md-menu md-size="medium" md-align-trigger>
        <md-button
          id="drawSelect"
          class="md-raised md-primary"
          md-menu-trigger
          :disabled="!dataLoaded"
        >
          {{ selectedShape }}
          <md-icon>arrow_drop_down</md-icon>
        </md-button>
        <md-menu-content>
          <md-menu-item
            v-for="shape in shapes"
            :key="shape"
            v-on:click="onChangeShape(shape)"
          >{{ shape }}</md-menu-item>
        </md-menu-content>
        <md-button class="md-raised md-primary" v-on:click="onReset()" :disabled="!dataLoaded">Reset</md-button>
        <md-button
          class="md-raised md-primary"
          v-on:click="showDicomTags = true"
          :disabled="!dataLoaded"
        >Tags</md-button>
      </md-menu>
      <div>
        <input
          type="text"
          v-model="windowCenter"
          placeholder="Window Center"
          v-on:keyup.enter="setWindow"
        >
        <input
          type="text"
          v-model="windowWidth"
          placeholder="Window Width"
          v-on:keyup.enter="setWindow"
        >
        <md-button class="md-raised md-primary" v-on:click="getWindow" :disabled="!dataLoaded">Get</md-button>
        <md-button class="md-raised md-primary" v-on:click="setWindow" :disabled="!dataLoaded">Set</md-button>
      </div>
      <!-- dicom tags dialog-->
      <md-dialog :md-active.sync="showDicomTags">
        <tagsTable :tagsData="tags"/>
      </md-dialog>
    </div>
  </div>
</template>

<script>
// import
import Vue from 'vue'
import MdButton from 'vue-material'
import dwv from 'dwv'
import tagsTable from './tags-table'

Vue.use(MdButton)

// gui overrides
// Url loader
dwv.gui.UrlLoad = dwv.gui.base.UrlLoad
// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery
// progress
dwv.gui.displayProgress = function () {}
// get element
dwv.gui.getElement = dwv.gui.base.getElement
// refresh element
dwv.gui.refreshElement = dwv.gui.base.refreshElement

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: 'static/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'static/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'static/dwv/decoders/pdfjs/decode-jpegbaseline.js'
}

export default {
  name: 'dwv',
  components: {
    tagsTable
  },
  data: function () {
    return {
      versions: {
        dwv: dwv.getVersion(),
        vue: Vue.version
      },
      windowCenter: 0,
      windowWidth: 0,
      dwvApp: null,
      tools: ['Scroll', 'ZoomAndPan', 'WindowLevel', 'Draw'],
      selectedTool: 'Select Tool',
      shapes: [
        'Arrow',
        'Ruler',
        'Protractor',
        'Rectangle',
        'Roi',
        'Ellipse',
        'FreeHand'
      ],
      selectedShape: 'Select Shape',
      loadProgress: 0,
      dataLoaded: false,
      tags: null,
      showDicomTags: false
    }
  },
  mounted () {
    // create app
    this.dwvApp = new dwv.App()
    // initialise app
    this.dwvApp.init({
      containerDivId: 'dwv',
      // gui: ['tool','help'],
      tools: this.tools,
      shapes: this.shapes,
      isMobile: true
    })
    // progress
    var self = this

    var slider = document.getElementById('scrollRange')
    slider.min = 0

    this.dwvApp.addEventListener('load-progress', function (event) {
      self.loadProgress = event.loaded
    })

    this.dwvApp.addEventListener('load-end', function () {
      self.dataLoaded = true
      self.tags = self.dwvApp.getTags()
      // console.log(self.tags)
      if (
        self.dwvApp.isMonoSliceData() &&
        self.dwvApp.getImage().getNumberOfFrames() === 1
      ) {
        self.selectedTool = 'ZoomAndPan'
        slider.style.display = 'none'
      } else {
        self.selectedTool = 'Scroll'
        slider.style.display = 'inline'
        if (!self.dwvApp.isMonoSliceData()) {
          slider.max =
            self.dwvApp
              .getImage()
              .getGeometry()
              .getSize()
              .getNumberOfSlices() - 1
        } else {
          slider.max = self.dwvApp.getImage().getNumberOfFrames() - 1
        }
      }
    })

    this.dwvApp.addEventListener('slice-change', function () {
      slider.value = self.dwvApp.getViewController().getCurrentPosition().k
    })
    this.dwvApp.addEventListener('frame-change', function () {
      slider.value = self.dwvApp.getViewController().getCurrentFrame()
    })

    // this.dwvApp.addEventListener('wl-center-change', function () {
    //   self.windowCenter = self.dwvApp.getViewController().getWindowLevel().center
    // })
    // this.dwvApp.addEventListener('wl-width-change', function () {
    //   self.windowWidth = self.dwvApp.getViewController().getWindowLevel().width
    // })
    // slider.oninput = function () {
    //   // self.dwvApp.getViewController().setCurrentFrame(self.value)
    //   if (isMonoSlice) {
    //     self.dwvApp.getViewController().setCurrentFrame(self.value)
    //   } else {
    //     var pos = self.dwvApp.getViewController().getCurrentPosition()
    //     pos.k = self.value
    //     self.dwvApp.getViewController().setCurrentPosition(pos)
    //   }
    // }
    slider.style.display = 'none'
    document.getElementById('drawSelect').style.display = 'none'
    if (this.$route.params.dicomLinks) {
      console.log(this.$route.params.dicomLinks)
      this.dwvApp.loadURLs(this.$route.params.dicomLinks)
    }
  },
  methods: {
    onChangeTool: function (tool) {
      if (tool === 'Draw') {
        document.getElementById('drawSelect').style.display = 'inline'
      } else {
        document.getElementById('drawSelect').style.display = 'none'
      }
      this.selectedTool = tool
      this.dwvApp.onChangeTool({ currentTarget: { value: tool } })
    },
    onChangeShape: function (shape) {
      this.selectedShape = shape
      this.dwvApp.onChangeShape({ currentTarget: { value: shape } })
    },
    onReset: function () {
      this.dwvApp.onDisplayReset()
    },
    getWindow: function () {
      this.windowCenter = this.dwvApp
        .getViewController()
        .getWindowLevel().center
      this.windowWidth = this.dwvApp.getViewController().getWindowLevel().width
    },
    setWindow: function () {
      this.dwvApp
        .getViewController()
        .setWindowLevel(this.windowCenter, this.windowWidth)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#notice {
  font-size: 3rem;
  margin-top: 2rem;
}
#dwv {
  font-family: Arial, Helvetica, sans-serif;
  height: 90%;
}
input[type="text"] {
  margin: 0.4rem auto;
  margin-right: 0.5rem;
  padding: 0.2rem;
  width: 7rem;
}
/* .md-progress-bar {
  margin: 0.1rem;
} */
.button-row {
  text-align: center;
  padding: 5px;
}

#dwv button {
  margin: 2px;
}

/* .legend {
  text-align: center;
  font-size: 8pt;
  margin: 1em;
} */

/* Layers */
.layerContainer {
  min-height:500px;
  position: relative;
  padding: 0;
  margin: auto;
  margin-top: 1rem;
  text-align: center;
}
.imageLayer {
  position: absolute;
  left: 0px;
}
.drawDiv {
  position: absolute;
  pointer-events: none;
}

/* drag&drop */
.dropBox {
  border: 5px dashed #ccc;
  margin: auto;
  text-align: center;
  vertical-align: middle;
  background: white;
  color: grey;
}
.dropBox.hover {
  border: 5px dashed #cc0;
}

.md-dialog {
  width: 80%;
  height: 90%;
}
</style>
