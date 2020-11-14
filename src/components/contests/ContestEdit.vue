<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="editedObject">
      <form @submit.prevent="saveContest" @reset.prevent="onReset">
        <b-form-group for="name" label="Contestname">
          <b-form-input placeholder="Contestname"
            v-model="editedObject.name" />
        </b-form-group>

        <b-form-group for="shortname" label="Short name">
          <b-form-input placeholder="Short name"
            v-model="editedObject.shortname" />
        </b-form-group>

        <b-form-group for="description" label="Description">
          <b-form-textarea placeholder="Description"
            v-model="editedObject.description" />
        </b-form-group>

        <b-form-group>
          <b-form-radio-group v-model="editedObject.ctype" plain
            v-bind:disabled="editedObject.has_draw"
          >
            <b-form-radio value="Groups" label="Contesttype" class="mx-2">
              {{ ctype_text('Groups') }}
            </b-form-radio>
            <b-form-radio value="KO" class="mx-2">
              {{ ctype_text('KO') }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>

        <b-form-group for="winning_sets" label="Number of sets to win">
          <b-form-input number min="1" max="20"
            v-model="editedObject.result_params.winning_sets" />
        </b-form-group>
      <!--
        <b-form-group for="public" label="Public">
          <b-form-checkbox v-model="editedObject.public" />
        </b-form-group>
      -->
        <b-button type="submit" variant="primary">Save</b-button>
        <b-button type="reset" variant="danger">Cancel</b-button>
      </form>
    </div>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'

export default {
  name: 'ContestEdit',
  mixins: [apiMixins],
  props: {
    contest: Object
  },
  data () {
    return {}
  },
  created () {
    if (this.contest) {
      this.prepareContestForEdit()
    }
  },
  computed: {
    allContests () {
      return this.$store.getters.allContests
    }
  },
  methods: {
    prepareContestForEdit () {
      this.editedObject = Object.assign({}, this.contest)
    },
    saveContest () {
      if (this.editedObject.id) {
        this.updateContest()
      } else {
        this.addContest()
      }
    },
    addContest () {
      const path = '/api/v1/contests'
      this.callAxiosAdd(path, 'insert', 'Contest',
        this.editedObject, this.getEditedData())
    },
    updateContest () {
      const path = `/api/v1/contests/${this.editedObject.id}`
      this.callAxiosUpdate(path, 'update', 'Contest',
        this.editedObject, this.getEditedData())
    },
    getEditedData () {
      return {
        contest: {
          name: this.editedObject.name,
          shortname: this.editedObject.shortname,
          description: this.editedObject.description,
          ctype: this.editedObject.ctype,
          result_params: this.editedObject.result_params
        }
      }
    }
  }
}
</script>
