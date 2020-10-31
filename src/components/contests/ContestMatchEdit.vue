<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="editedObject">
      <form @submit.prevent="updateMatch" @reset.prevent="onReset">

        <b-form-group for="planned_at" label="Planned Date">
          <date-picker
            v-model="editedObject.planned_at"
            v-bind:config="datePickerOptions"
          ></date-picker>
        </b-form-group>

        <b-form-group v-if="matchComplete" for="result" label=Result>
          <b-table-simple borderless class="d-inline" id="resulttable">
            <b-tbody>
              <b-tr>
                <b-td class="text-right">
                  {{ getParticipantName(editedObject.participant_1_id) }}
                </b-td>
                <b-td class="text-center">&nbsp;&#58;&nbsp;</b-td>
                <b-td class="text-left">
                  {{ getParticipantName(editedObject.participant_2_id) }}
                </b-td>
              </b-tr>
              <b-tr v-for="s in maxNumberSets()" v-bind:key="s">
                <b-td class="text-right">
                  <b-input type="number" min="0" class="text-center"
                    style="width: 5em" :autofocus="s === 1"
                    v-model="editedScore[s-1][0]" />
                </b-td>
                <b-td class="text-center">&nbsp;&#58;&nbsp;</b-td>
                <b-td class="text-left">
                  <b-input type="number" min="0" class="text-center"
                    style="width: 5em"
                    v-model="editedScore[s-1][1]" />
                </b-td>
              </b-tr>
              <b-tr>
                <b-td colspan="3" class="text-center">
                  <b-form-radio-group label="Winner"
                      v-model="editedObject.winner_id" plain>
                    <b-form-radio :value="editedObject.participant_1_id"
                        class="mx-2">
                    </b-form-radio>
                    Winner
                    <b-form-radio :value="editedObject.participant_2_id"
                        class="mx-2">
                      &nbsp;
                    </b-form-radio>
                    <div v-if="tieAllowed">
                      <b-form-radio value="0">
                        Tie
                      </b-form-radio>
                    </div>
                  </b-form-radio-group>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td colspan="3" class="text-center">
                  <b-form-checkbox id="walk-over" name="walk-over"
                      v-model="editedObject.result.walk_over" inline>
                    walk over
                  </b-form-checkbox>
                  <span v-if="false"> <!-- not yet used, only in KO -->
                    <b-form-checkbox id="lucky-loser" name="lucky-loser"
                        v-model="editedObject.result.lucky_loser" inline>
                      lucky loser
                    </b-form-checkbox>
                  </span>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
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
  name: 'ContestMatchEdit',
  mixins: [apiMixins],
  props: {
    match: Object
  },
  data () {
    return {
      editedScore: false,
      datePickerOptions: {
        format: 'DD.MM.YYYY HH:mm',
        useCurrent: true,
        showClear: true,
        showClose: true,
        stepping: 5,
        sideBySide: false,
        toolbarPlacement: 'bottom',
        icons: {
          time: 'fas fa-clock',
          date: 'fas fa-calendar',
          up: 'fas fa-arrow-up',
          down: 'fas fa-arrow-down',
          previous: 'fas fa-chevron-left',
          next: 'fas fa-chevron-right',
          today: 'fas fa-calendar-check',
          clear: 'fas fa-trash-alt',
          close: 'fas fa-times-circle'
        }
      }
    }
  },
  //
  created () {
    if (this.match) {
      this.prepareMatchForEdit()
    }
  },
  watch: {
    editedScore: {
      deep: true,
      handler: function (newScore) {
        if (newScore && this.editedObject) {
          const a = newScore.flat().filter(x => { return x !== '' })
          if (a.length === 0) {
            this.editedObject.winner_id = null
          }
        }
      }
    }
  },
  computed: {
    tieAllowed () {
      return this.currentContest.result_params &&
          this.currentContest.result_params.tie_allowed
    },
    matchComplete () {
      return this.match.participant_1_id > 0 && this.match.participant_2_id > 0
    }
  },
  methods: {
    getParticipantName (id) {
      const p = this.currentParticipants.find(p => p.id === id)
      return p ? p.name : ''
    },
    maxNumberSets () {
      return this.currentContest.result_params.winning_sets * 2 - 1
    },
    prepareMatchForEdit () {
      this.editedObject = Object.assign({}, this.match)
      if (!this.editedObject.result) {
        this.editedObject.result = {
          score_p1: [],
          score_p2: [],
          walk_over: false,
          lucky_loser: false
        }
      }
      this.prepareScoreForEdit(this.editedObject.result)
    },
    prepareScoreForEdit (result) {
      if (result && result.score_p1 && result.score_p2) {
        this.editedScore = result.score_p1.map(
          (e, i) => [e, result.score_p2[i]])
      } else {
        this.editedScore = []
      }
      while (this.editedScore.length < this.maxNumberSets()) {
        this.editedScore.push(['', ''])
      }
    },
    prepareScoreForSave () {
      let scoreP1 = []
      let scoreP2 = []
      this.editedScore.forEach(set => {
        if (set[0] !== '' || set[1] !== '') {
          scoreP1.push(Number(set[0]))
          scoreP2.push(Number(set[1]))
        }
      })
      return [scoreP1, scoreP2]
    },
    updateMatch () {
      const path = `/api/v1/contests/${this.currentContest.id}` +
          `/matches/${this.editedObject.id}`
      this.callAxiosUpdate(path, 'update', 'Match',
        this.editedObject, this.getEditedData())
    },
    getEditedData () {
      const score = this.prepareScoreForSave()
      let editedResult = null
      if (this.editedObject.winner_id !== null) {
        editedResult = {
          score_p1: score[0],
          score_p2: score[1],
          walk_over: this.editedObject.result.walk_over || false,
          lucky_loser: this.editedObject.result.lucky_loser || false
        }
      }
      const data = {
        match: {
          planned_at: this.editedObject.planned_at,
          result: editedResult,
          winner_id: this.editedObject.winner_id
        }
      }
      return data
    }
  }
}
</script>
