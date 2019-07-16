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
    <input type="range" id="scrollRange" value="0" readonly>
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
        <md-button id="drawSelect" class="md-raised md-primary" md-menu-trigger :disabled="!dataLoaded" >
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
      <div id="saveDrawsBtn">
        <md-button class="md-raised md-primary" v-on:click="saveDraws" :disabled="!dataLoaded">Save Draws</md-button>
        <md-button class="md-raised md-primary" v-on:click="loadDraws" :disabled="!dataLoaded">Load Draws</md-button>
      </div>
      <div id="headDetection">
        <md-progress-spinner align-items='center' id='waitbar' class="md-raised md-primary" :md-diameter="15" :md-stroke="2" md-mode="indeterminate"></md-progress-spinner>
        <md-menu md-size="medium" md-align-trigger>
          <md-button class="md-raised md-primary" md-menu-trigger :disabled="!dataLoaded">
            {{ selectedMethod }}
            <md-icon>arrow_drop_down</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item v-for="method in methods" :key="method" v-on:click="onChangeMethod(method)">{{ method }}</md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button class="md-raised md-primary" v-on:click="detect()" :disabled="!dataLoaded">Detect</md-button>
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
const API = process.env.API_ROOT
// const MODEL_SERVER = '//47.103.106.241/deepserver'
const MODEL_SERVER = '//127.0.0.1:5000/deepserver'
Vue.use(MdButton)

// gui overrides
// Prompt
dwv.gui.prompt = dwv.gui.base.prompt
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
      methods: ['Head Detection', 'Future Work'],
      selectedTool: 'Select Tool',
      selectedMethod: 'Select Method',
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
      showDicomTags: false,
      DcmNo: 1
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
          slider.max = self.dwvApp.getImage().getGeometry().getSize().getNumberOfSlices() - 1
        } else {
          slider.max = self.dwvApp.getImage().getNumberOfFrames() - 1
        }
      }
      var size = {
        width: self.dwvApp.getImage().getGeometry().getSize().getNumberOfColumns(),
        height: self.dwvApp.getImage().getGeometry().getSize().getNumberOfRows()
      }
      console.log(size)
      self.dwvApp.fitToSize(size)
    })

    this.dwvApp.addEventListener('slice-change', function () {
      slider.value = self.dwvApp.getViewController().getCurrentPosition().k
    })
    this.dwvApp.addEventListener('frame-change', function () {
      slider.value = self.dwvApp.getViewController().getCurrentFrame()
    })

    slider.style.display = 'none'
    document.getElementById('drawSelect').style.display = 'none'
    if (this.$route.params.dicomLinks) {
      this.dwvApp.loadURLs(this.$route.params.dicomLinks)
    }
    document.getElementById('waitbar').style.display = 'none'
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

    onChangeMethod: function (method) {
      this.selectedMethod = method
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
      console.log(this.windowCenter)
      console.log(this.windowWidth)
    },

    setWindow: function () {
      console.log(this.windowCenter)
      console.log(this.windowWidth)
      this.dwvApp
        .getViewController()
        .setWindowLevel(parseInt(this.windowCenter), parseInt(this.windowWidth))
    },

    saveDraws: function () {
      var drawings = this.dwvApp.getDrawController().getDrawLayer().toObject()
      var drawingsDetails = this.dwvApp.getDrawStoreDetails()
      var ReferencedStudyInstanceUID = this.dwvApp.getTags().filter(tag => {
        return tag.name === 'StudyInstanceUID'
      })[0].value
      var AnnotationFileCreationDate = Date.now()
      var SOPInstanceUID = ReferencedStudyInstanceUID + Date.now()
      var AnnotationFileName = ReferencedStudyInstanceUID + Date.now() + '.json'
      var SOPClassUID = '1.2.840.10008.5.1.4.1.1.11.1'

      var drawingJson = {
        ReferencedStudyInstanceUID,
        AnnotationFileCreationDate,
        AnnotationFileName,
        SOPInstanceUID,
        SOPClassUID,
        drawings,
        drawingsDetails
      }
      console.log(drawingJson)
      this.$http.post(API + '/savedraws', drawingJson).then(
        response => {
          if (response.body.status) {
            alert(response.body.message)
          } else {
            alert(response.body.message)
          }
        },
        response => {
          alert('保存失败！')
        }
      )
    },

    loadDraws: function () {
      var ReferencedStudyInstanceUID = this.dwvApp.getTags().filter(tag => {
        return tag.name === 'StudyInstanceUID'
      })[0].value
      this.$http.post(API + '/getdraws', ReferencedStudyInstanceUID).then(
        response => {
          if (response.body.status) {
            var drawings = response.body.item.drawings
            var drawingsDetails = response.body.item.drawingsDetails
            console.log(drawings)
            console.log(drawingsDetails)
            this.dwvApp.setDrawings(drawings, drawingsDetails)
            alert('载入标注成功！')
          } else {
            alert(response.body.message)
          }
        },
        response => {
          alert('载入标注失败！')
        }
      )
    },

    detect: function () {
      if (this.dataLoaded === false) {
        alert('图像未加载.')
        return
      }
      if (this.selectedMethod !== 'Head Detection') {
        alert('请选择正确的方法.')
        return
      }
      document.getElementById('waitbar').style.display = 'inline-flex'
      var c = this.dwvApp.getImageLayer()
      var img = c.getContext().getImageData(0, 0, c.getCanvas().width, c.getCanvas().height)
      console.log(img)

      let formData = new FormData()
      formData.append('image', img.data)
      formData.append('width', img.width)
      formData.append('height', img.height)
      console.log(formData)

      var drawLayer = this.dwvApp.getDrawController().getDrawLayer()
      var self = this
      this.$http.post(MODEL_SERVER + '/detectHead', formData).then(response => {
        var idx
        var res = response.body
        var resList = res.split(';')
        for (idx in resList) {
          if (resList[idx].length !== 0) {
            console.log(resList[idx])
            var box = resList[idx].split(',').map(Number)
            console.log(box)
            var shapeGroup = new dwv.tool.RectangleFactory.prototype.create([new dwv.math.Point2D(box[0], box[1]), new dwv.math.Point2D(box[2], box[3])], self.dwvApp.getStyle(), self.dwvApp.getImage())
            drawLayer.add(shapeGroup)
            drawLayer.draw()
            document.getElementById('waitbar').style.display = 'none'
          }
        }
      })
      var drawings = this.dwvApp.getDrawController().getDrawLayer().toObject()
      console.log(drawings)
      var drawingsDetails = this.dwvApp.getDrawStoreDetails()
      console.log(drawingsDetails)
      // // TODO:
      // setTimeout(function () {
      //   document.getElementById('waitbar').style.display = 'none'
      //   console.log(self.dwvApp.getTags())
      //   var link = 'http://192.168.1.109/dcm/' + self.DcmNo + 'new.dcm'
      //   self.DcmNo = self.DcmNo + self.DcmNo + 2
      //   self.dwvApp.loadURLs([link])
      // }, Math.floor(2000 + 2000 * Math.random()))
      // document.getElementById('waitbar').style.display = 'inline-flex'
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
