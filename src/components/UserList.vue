<template>
	<div id="userlist" class="ui container">
		<vuetable ref="vuetable"
			:api-mode="false"
			:fields="fields"
      :per-page="perPage"
			:data-manager="dataManager"
      pagination-path="pagination"
	    @vuetable:pagination-data="onPaginationData"
		>
      <div>123</div>
			<div slot="actions" slot-scope="props">
				<button
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
				</button>
			</div>
		</vuetable>
    <div style="padding-top:10px">
      <vuetable-pagination ref="pagination"
        @vuetable-pagination:change-page="onChangePage"
      ></vuetable-pagination>
    </div>
    <!-- user edit -->
    <md-dialog :md-active.sync="showEditDialog">
      <div id='userEditDialog'>
      <h1>用户信息修改</h1>
      <md-field>
        <label>User ID</label>
        <md-input v-model="userid" readonly></md-input>
      </md-field>
      <md-field>
        <label>User Name</label>
        <md-input v-model="username"></md-input>
      </md-field>
      <md-field>
        <label for="usergroup">User Group</label>
        <md-select v-model="usergroup" name="usergroup" id="usergroup">
          <md-option value="administrator">administrator</md-option>
          <md-option value="doctor">doctor</md-option>
        </md-select>
      </md-field>
      <md-field>
        <label>Password</label>
        <md-input type="password" v-model="userpassword"></md-input>
      </md-field>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showEditDialog = false">关闭</md-button>
        <md-button class="md-primary" @click="updateUserInfo">保存</md-button>
      </md-dialog-actions>
      </div>
    </md-dialog>

	</div>
</template>

<script>
import Vuetable from 'vuetable-2'
import VuetablePagination from 'vuetable-2/src/components/VuetablePagination'
import UserFieldsDef from '../UserFieldsDef.js'
import auth from '../auth'
// import axios from 'axios'
import _ from 'lodash'
const API = process.env.API_ROOT
export default {
  id: 'userlist',
  components: {
    Vuetable,
    VuetablePagination
  },

  data () {
    return {
      fields: UserFieldsDef,
      perPage: 3,
      data: [],
      showEditDialog: false,
      userid: null,
      username: null,
      usergroup: null,
      userpassword: null
    }
  },

  watch: {
    data (newVal, oldVal) {
      this.$refs.vuetable.refresh()
    }
  },

  mounted () {
    this.$http.get(API + '/userlist').then(response => {
      this.data = response.data
    }, response => {
      alert(response.statusText)
    })
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
      if (action === 'edit-item') {
        this.userid = data.userid
        this.username = data.username
        this.usergroup = data.usergroup
        this.userpassword = data.userpassword
        this.showEditDialog = true
      } else {
        var userObj = JSON.parse(localStorage.getItem('id_token'))
        if (userObj.userid === this.userid) {
          alert('禁止删除自身！')
          return
        }
        var res = confirm('确认删除用户:' + data.username + '？(该操作无法恢复)')
        if (res) {
          this.$http.post(API + '/user/delete', data.userid).then(response => {
            if (response.body.status) {
              alert(response.body.message)
              this.$router.go(0)
            } else {
              alert(response.body.message)
              this.$router.go(0)
            }
          })
        }
      }
    },
    updateUserInfo () {
      var credentials = {
        username: this.username,
        userid: this.userid,
        userpassword: this.password,
        usergroup: this.usergroup
      }
      auth.update(this, credentials, 'userlist')
      this.showEditDialog = false
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
#userEditDialog {
  margin: 2rem;
}
</style>
