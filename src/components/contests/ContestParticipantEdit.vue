<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="editedObject">
      <form @submit.prevent="saveParticipant" @reset.prevent="onReset">

        <b-form-group for="name" label="Name">
          <b-form-input
            placeholder="Name"
            v-model="editedObject.name"
            autofocus />
        </b-form-group>

        <b-form-group for="shortname" label="Short name">
          <b-form-input placeholder="Short name" v-model="editedObject.shortname" />
        </b-form-group>

        <b-form-group for="remarks" label="Remarks">
          <b-form-textarea placeholder="Remarks" v-model="editedObject.remarks" />
        </b-form-group>

        <b-button type="submit" variant="primary">Save</b-button>
        <b-button type="reset" variant="danger">Cancel</b-button>
      </form>
    </div>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'ContestParticipantEdit',
  mixins: [apiMixins],
  props: {
    participant: Object
  },
  data () {
    return {}
  },
  created () {
    if (this.participant) {
      this.prepareParticipantForEdit()
    }
  },
  methods: {
    prepareParticipantForEdit () {
      this.editedObject = Object.assign({}, this.participant)
    },
    saveParticipant () {
      if (this.editedObject.id) {
        this.updateParticipant()
      } else {
        this.addParticipant()
      }
    },
    addParticipant () {
      const path = `/api/v1/contests/${this.currentContest.id}/participants`
      this.callAxiosAdd(path, 'insert', 'Participant',
        this.editedObject, this.getEditedData())
    },
    updateParticipant () {
      const path = `/api/v1/contests/${this.currentContest.id}` +
          `/participants/${this.editedObject.id}`
      this.callAxiosUpdate(path, 'update', 'Participant',
        this.editedObject, this.getEditedData())
    },
    getEditedData () {
      return {
        participant: {
          name: this.editedObject.name,
          shortname: this.editedObject.shortname,
          remarks: this.editedObject.remarks
        }
      }
    }
  }
}
</script>
