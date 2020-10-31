<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <div v-if="currentContest && !editedObject">
      <div v-if="currentContest.ctype == 'KO' && currentContest.ctype_params.draw_tableau">
        <div
          v-for="(group, grp) in currentContest.ctype_params.draw_tableau"
          v-bind:key="grp"
        >
          <b-table-simple class="mb-5 ko">
            <b-tbody>
              <b-tr
                v-for="(row1, row) in 2 * group.length"
                v-bind:key="row"
              >
                <b-td
                  v-for="rowspan in rowspans(group, row)"
                  v-bind:key="rowspan"
                  v-bind:rowspan="rowspan"
                  class="ko"
                  v-bind:class="{
                    'ko-center': rowspan > 1,
                    'ko-above': textAbove(row, rowspan),
                    'ko-below': textBelow(row, rowspan),
                    'ko-inside': [1, 2].includes((row / rowspan) % 4) &&
                                  rowspan < tableauSize(group),
                    'ko-outside': [0, 3].includes((row / rowspan) % 4) ||
                                  rowspan === tableauSize(group)
                  }"
                >
                  <div v-if="setActualTableauPos(group, grp + 1, row, rowspan)">
                    <div v-if="actualTableauPos.editable">
                      <b-link
                        v-on:click="editedObject = getMatchByRowSpan(group, grp + 1, row, rowspan)"
                        variant="success"
                      >
                        <span v-if="actualTableauPos.text !== 'add'">
                          {{ actualTableauPos.text }}
                        </span>
                        <span v-else>
                          <b-icon icon="pencil-square" scale="1"></b-icon>
                        </span>
                      </b-link>
                    </div>
                    <div v-else>
                      {{ actualTableauPos.text }}
                    </div>
                  </div>
                  <div v-else>
                    &nbsp;
                  </div>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </div>
      </div>
    </div>

    <div v-else>
      <contest-match-edit
        v-bind:match="editedObject"
        v-on:finishedAxios="finishedEditing($event)"
      ></contest-match-edit>
    </div>

  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import ContestMatchEdit from '@/components/contests/ContestMatchEdit.vue'

export default {
  name: 'ContestTableauKo',
  mixins: [apiMixins],
  actualTableauPos: '', // non-reactive cached data for actual position
  data () {
    return {
    }
  },
  computed: {
    nbrGroups () {
      return this.currentContest.ctype_params.draw_tableau.length
    }
  },
  methods: {
    tableauSize (group) {
      return group.length
    },
    rowspans (group, row) {
      const a = Array.from({length: Math.log2(group.length) + 1},
        (x, i) => Math.pow(2, i))
      const r = a.filter(x => row % x === 0)
      // console.log(`rowspans: ${r}`)
      return r
    },
    setActualTableauPos (group, groupNr, row, rowspan) {
      let tableau = { text: '', editable: false }
      if (rowspan === 1 && row % 2 === 0) {
        // first column, above: participant name or 'BYE'
        tableau.text = this.getParticipantByPos(groupNr, row / 2 + 1)
      } else if (rowspan > 1) {
        let m = this.getMatchByRowSpan(group, groupNr, row, rowspan)
        if (m) {
          if (m.winner_id && this.textAbove(row, rowspan)) {
            // match with result, above: winner short name
            tableau.text = this.getParticipantShortName(m.winner_id, null)
          } else if (m.winner_id && this.textBelow(row, rowspan)) {
            // match with result, below: result, evtl. editable
            tableau.text = m.result_1_vs_2
            tableau.editable = m.editable
          } else if (m.planned_at && this.textAbove(row, rowspan)) {
            // match without result but planned_at, above: planned_at
            tableau.text = this.formatDate(m.planned_at)
          } else if (this.textBelow(row, rowspan)) {
            // match without result yet, below: evtl. editable
            tableau.text = m.editable ? 'add' : ''
            tableau.editable = m.editable

          }
        } else if (rowspan === 2) {
          // column 2, but no match because of a BYE in column 1:
          // show short name of the participant having a BYE
          let nm = this.getNextMatchByRowSpan(group, groupNr, row, rowspan)
          if (nm && this.textAbove(row, rowspan)) {
            const id = (this.textPos(row, rowspan) % 2 === 1
              ? nm.participant_1_id : nm.participant_2_id)
            tableau.text = this.getParticipantShortName(id, null)
          }
        }
      }
      tableau.editable = tableau.editable && this.userOrWriteToken
      this.actualTableauPos = tableau.text === '' ? null : tableau
      return this.actualTableauPos
    },
    getParticipantByPos (groupNr, pos) {
      const p = this.currentParticipants.find(p =>
        p.ctype_params.draw_group === groupNr && p.ctype_params.draw_pos === pos
      )
      return p ? p.name : 'BYE'
    },
    getMatchByPos (groupNr, round, pos) {
      const m = this.currentMatches.find(m =>
        m.ctype_params.draw_group === groupNr &&
          m.ctype_params.draw_round === round &&
          m.ctype_params.draw_pos === pos)
      return m
    },
    getMatchByRowSpan (group, groupNr, row, rowspan) {
      const round = this.textRound(group, row, rowspan)
      const pos = this.textPos(row, rowspan)
      return this.getMatchByPos(groupNr, round, pos)
    },
    getNextMatchByRowSpan (group, groupNr, row, rowspan) {
      const nextRound = this.textRound(group, row, rowspan) / 2
      const nextPos = Math.ceil(this.textPos(row, rowspan) / 2)
      return this.getMatchByPos(groupNr, nextRound, nextPos)
    },
    getParticipantName (id) {
      const p = this.currentParticipants.find(p => p.id === id)
      return p ? p.name : ''
    },
    getParticipantShortName (id) {
      const p = this.currentParticipants.find(p => p.id === id)
      return p ? p.shortname : ''
    },
    textRound (group, row, rowspan) {
      return this.tableauSize(group) / rowspan
    },
    textPos (row, rowspan) {
      return Math.floor(row / rowspan / 2) + 1
    },
    textAbove (row, rowspan) {
      return (row / rowspan) % 2 === 0
    },
    textBelow (row, rowspan) {
      return (row / rowspan) % 2 === 1
    }
  },
  components: {
    ContestMatchEdit
  }
}
</script>

<style>
table.ko {
  border-collapse: separate;
  border-spacing: 0px;
  line-height: 1em;
}
td.ko {
  border: none;
}
td.ko-above {
  border-bottom: medium solid darkgray;
  vertical-align: bottom;
  padding-bottom: 0.25rem;
}
td.ko-below {
  border-bottom: none;
  vertical-align: top;
  padding-top: 0.25rem;
}
td.ko-inside {
  border-right: medium solid darkgray;
}
td.ko-outside {
}
td.ko-center {
  text-align: center;
}
</style>
