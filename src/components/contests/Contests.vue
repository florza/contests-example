<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="!editedObject">
      <b-table striped hover :items="allContests" :fields="fields"
        primary-key="id">
        <template v-slot:cell(name)="data">
          <b-button variant="link" v-on:click="changeTo(data.item)">
            {{ data.value }}
          </b-button>
        </template>
        <template v-slot:cell(edit)="data">
          <b-link v-on:click="editedObject = data.item">
            <b-icon icon="pencil-square" scale="2"></b-icon>
          </b-link>
        </template>
        <template v-slot:cell(delete)="data">
          <b-link v-on:click="showDeleteMsg(data.item)">
            <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
          </b-link>
        </template>
      </b-table>
      <b-button v-on:click="editedObject = {result_params: { winning_sets: 1}}">
        Add</b-button>
    </div>

    <div v-else>
      <contest-edit
        v-bind:contest="editedObject"
        v-on:finishedAxios="finishedEditing($event)"
      ></contest-edit>
    </div>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import ContestEdit from '@/components/contests/ContestEdit.vue'

export default {
  name: 'Contests',
  mixins: [apiMixins],
  data () {
    return {
      fields: [
        'name',
        'shortname',
        { key: 'ctype', label: 'Type' },
        { key: 'edit', class: 'text-center' },
        { key: 'delete', class: 'text-center' }
      ]
    }
  },
  computed: {
    allContests () {
      return this.$store.getters.allContests
    }
  },
  methods: {
    changeTo (contest) {
      this.touchContest(contest)
      this.$router.replace('/contest')
    },
    touchContest (contest) {
      const path = `/api/v1/contests/${contest.id}`
      const data = {
        contest: {
          last_action_at: (new Date()).toUTCString()
        }
      }
      this.callAxiosUpdate(path, 'touch', 'Contest', this.editedObject, data)
    },
    showDeleteMsg (contest) {
      this.boxOne = ''
      this.$bvModal.msgBoxConfirm(
        `Do you really want to delete contest ${contest.shortname}?`
      )
        .then(okResponse => {
          if (okResponse) {
            this.removeContest(contest)
          }
        })
        .catch(error => {
          this.setError(error, 'Error displaying message box')
        })
    },
    removeContest (contest) {
      const path = `/api/v1/contests/${contest.id}`
      this.callAxiosDelete(path, 'delete', 'Contest', this.editedObject)
    }
  },
  components: {
    ContestEdit
  }
}
</script>
