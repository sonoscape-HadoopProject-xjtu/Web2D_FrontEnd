<template>
  <div id="studylist" class="ui container">
    <vuetable
      ref="vuetable"
      :api-mode="false"
      :fields="fields"
      :per-page="perPage"
      :data-manager="dataManager"
      pagination-path="pagination"
      @vuetable:pagination-data="onPaginationData"
    >
      <div slot="actions" slot-scope="props">
        <button class="ui small button" @click="onActionClicked('open-item', props.rowData)">
          <i class="folder open icon"></i>
        </button>
        <!-- <button
					class="ui small button"
					@click="onActionClicked('edit-item', props.rowData)"
				>
					<i class="edit icon"></i>
				</button>
				<button
					class="ui small button"
					@click="onActionClicked('delete-item', props.rowData)"
				>
					<i class="delete icon"></i>
        </button>-->
      </div>
    </vuetable>
    <div style="padding-top:10px">
      <vuetable-pagination ref="pagination" @vuetable-pagination:change-page="onChangePage"></vuetable-pagination>
    </div>
  </div>
</template>

<script>
import Vuetable from 'vuetable-2'
import VuetablePagination from 'vuetable-2/src/components/VuetablePagination'
import FieldsDef from '../DicomFieldsDef.js'
// import axios from 'axios'
import _ from 'lodash'
const API = process.env.API_ROOT
export default {
  id: 'studylist',
  components: {
    Vuetable,
    VuetablePagination
  },

  data () {
    return {
      fields: FieldsDef,
      perPage: 10,
      data: []
    }
  },

  watch: {
    data (newVal, oldVal) {
      this.$refs.vuetable.refresh()
    }
  },

  mounted () {
    console.log('trying')
    this.$http.get(API + '/studylist').then(
      response => {
        console.log(response.data)
        this.data = response.data
      },
      response => {
        alert(response.statusText)
      }
    )
  },

  methods: {
    onPaginationData (paginationData) {
      this.$refs.pagination.setPaginationData(paginationData)
    },
    onChangePage (page) {
      this.$refs.vuetable.changePage(page)
    },
    dataManager (sortOrder, pagination) {
      if (this.data.length < 1) return

      let local = this.data

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        console.log('orderBy:', sortOrder[0].sortField, sortOrder[0].direction)
        local = _.orderBy(
          local,
          sortOrder[0].sortField,
          sortOrder[0].direction
        )
      }

      pagination = this.$refs.vuetable.makePagination(
        local.length,
        this.perPage
      )
      console.log('pagination:', pagination)
      let from = pagination.from - 1
      let to = from + this.perPage

      return {
        pagination: pagination,
        data: _.slice(local, from, to)
      }
    },
    onActionClicked (action, data) {
      if (action === 'open-item') {
        var dicomLinks = []
        data.DicomFilePath.split(',').forEach(dicomPath => {
          var orginLink = 'http://106.14.188.106:50070/webhdfs/v1' + dicomPath + '?op=OPEN'
          dicomLinks.push(orginLink)
        })
        this.$router.push({
          name: 'viewer',
          params: {
            dicomLinks
          }
        })
      }
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
button.ui.button {
  padding: 8px 3px 8px 10px;
  margin-top: 1px;
  margin-bottom: 1px;
}
</style>
