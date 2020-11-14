<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="!editedObject">
      <b-table striped hover :items="currentParticipants"
        :fields="displayedFields"
        primary-key="currentParticipants.id"
        sort-by="name"
      >
        <template v-slot:cell(edit)="data">
          <b-link
            v-on:click="editedObject = data.item">
            <b-icon icon="pencil-square" scale="2"></b-icon>
          </b-link>
        </template>
        <template v-slot:cell(delete)="data">
           <b-link v-on:click="showDeleteMsg(data.item)"
            v-bind:disabled="currentContest.has_draw"
          >
            <b-icon icon="x-circle" scale="2" variant="danger"></b-icon>
          </b-link>
        </template>
      </b-table>
      <b-button v-on:click="editedObject = {}"
        v-bind:disabled="currentContest.has_draw"
      >
        Add
      </b-button>
    </div>

    <div v-else>
      <contest-participant-edit
        v-bind:participant="editedObject"
        v-on:finishedAxios="finishedEditing($event)"
      ></contest-participant-edit>
    </div>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import ContestParticipantEdit from '@/components/contests/ContestParticipantEdit.vue'

export default {
  name: 'ContestParticipants',
  mixins: [apiMixins],
  data () {
    return {
      fields: [
        'name', 'shortname', 'remarks',
        { key: 'edit', class: 'text-center' },
        { key: 'delete', class: 'text-center' }
      ]
    }
  },
  created () {
    this.confirmation = ''
  },
  computed: {
    displayedFields () {
      if (this.signinType() !== 'user') {
        return this.fields.filter(o =>
          typeof o === 'string' || !['edit', 'delete'].includes(o.key))
      }
      return this.fields
    }
  },
  methods: {
    showDeleteMsg (participant) {
      this.boxOne = ''
      this.$bvModal.msgBoxConfirm(
        `Do you really want to delete participant ${participant.shortname}?`
      )
        .then(okResponse => {
          if (okResponse) {
            this.removeParticipant(participant)
          }
        })
        .catch(error => {
          this.setError(error, 'Error displaying message box')
        })
    },
    removeParticipant (participant) {
      const path = `/api/v1/contests/${this.currentContest.id}` +
          `/participants/${participant.id}`
      this.callAxiosDelete(path, 'delete', 'Participant', this.editedObject)
    }
  },
  components: {
    ContestParticipantEdit
  }
}
</script>
