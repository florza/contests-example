<template>
  <div>
    <base-messages
      v-bind:confirmation="confirmation"
      v-bind:errors="errors"
    ></base-messages>

    <b-row>
      <b-col>
        <div>
          <span>
            <base-incrementor
              v-bind:value="nbrSeeds + ' seeds'"
              v-bind:decrement="lessSeeds"
              v-bind:increment="moreSeeds"
              v-bind:decrementDisabled="lessSeedsDisabled()"
              v-bind:incrementDisabled="moreSeedsDisabled()"
              ></base-incrementor>
          </span>
          <span class="float-right">
            <b-button v-on:click="callConfirmed('save')"
              variant="primary"
              v-bind:disabled="currentContest.has_started"
            >
              {{ drawParticipantsEmpty() ? 'Save draw' : 'Create draw'}}
            </b-button>
          </span>
        </div>
        <draggable class="list-group w-100 border border-secondary"
          v-model="drawParticipants"
          draggable=".item"
          group="draw"
          ghost-class="drag-target"
          v-bind:move="handleMove"
          @end="handleDragEnd"
        >
          <div v-for="(ppant, pIndex) in drawParticipants" :key="ppant.id"
            v-bind:id="'p-' + pIndex"
            v-bind:class="{ emptySlot: ppant.pos === -1 }"
            class="item list-group-item"
          >
            <div>{{ ppant.name + (ppant.seed ? ppant.seedsuffix : '') }}</div>
          </div>
          <div slot="header" role="group" class="list-group-item">
            <h5>Participants</h5>
          </div>
        </draggable>
        <div class="mt-4 bg-primary">
          <p>
            Manual (unrestricted) draw:
            <ul>
              <li v-if="currentContestType == 'Groups'">
                Define number and sizes of groups with the +/- buttons
              <li v-else>
                Eventually move BYE positions if the given standard position do not fit
              </li>
              <li>
                Drag some or all participants to the desired positions
              </li>
              <li>
                Keep the number of seeds at zero
              <li>
                Create a draw which will randomly fill the remaining participants into the empty slots
              </li>
            </ul>
          </p>
          <p>
            Seeded draw:
            <ul>
              <li v-if="currentContestType == 'Groups'">
                Define number and sizes of groups with the +/- buttons
              </li>
              <li>
                Define the number of seeds
              </li>
              <li>
                Drag the best participants to their seed positions
              </li>
              <li>
                Create a complete new draw
              </li>
            </ul>
          </p>
        </div>
      </b-col>

      <b-col>
        <div v-if="drawTableau[0]">
          <span v-if="currentContestType == 'Groups'">
            <base-incrementor
              v-bind:value="nbrGroups + ' group(s)'"
              v-bind:decrement="lessGroups"
              v-bind:increment="moreGroups"
              v-bind:decrementDisabled="lessGroupsDisabled()"
              v-bind:incrementDisabled="moreGroupsDisabled()"
            ></base-incrementor>
          </span>
          <span class="float-right">
            <!--
            <b-button v-on:click="saveDraw" variant="primary">
              Save manual draw
            </b-button>
            -->
            <b-button v-on:click="callConfirmed('delete')"
              variant="danger"
              v-bind:disabled="currentContest.has_started"
            >
              Delete draw
            </b-button>
          </span>
        </div>
        <div v-for="groupNr in nbrGroups"
          v-bind:key="groupNr"
          class="mb-5 border border-secondary"
        >
          <b-table-simple outlined class="mb-0">
            <b-thead>
              <b-th colspan="1">
                <h5>
                  <span v-if="currentContestType == 'KO'">
                    Knockout tableau
                  </span>
                  <span v-if="currentContestType == 'Groups'">
                    Group {{ groupNr }}
                  </span>
                  <span v-if="currentContestType == 'Groups' && nbrGroups > 1"
                    class="float-right"
                  >
                    <base-incrementor
                      v-bind:value="String(drawTableau[groupNr - 1] ? drawTableau[groupNr - 1].length : 0)"
                      v-bind:param="groupNr - 1"
                      v-bind:decrement="smallerGroup"
                      v-bind:increment="biggerGroup"
                      v-bind:decrementDisabled="smallerGroupDisabled(groupNr - 1)"
                      v-bind:incrementDisabled="biggerGroupDisabled(groupNr - 1)"
                    ></base-incrementor>
                  </span>
                </h5>
              </b-th>
            </b-thead>
            <b-tbody>
              <draggable
                v-model="drawTableau[groupNr - 1]"
                draggable=".item"
                group="draw"
                filter=".fixed"
                ghost-class="drag-target"
                v-bind:disabled="nbrSeeds > 0"
                v-bind:move="handleMove"
                v-on:end="handleDragEnd"
              >
                <b-tr
                  v-for="(pos, dIndex) in drawTableau[groupNr - 1]"
                  v-bind:key="pos.id"
                  v-bind:id="`d-${groupNr - 1}-${dIndex}`"
                  v-bind:class="{ 'item': nbrSeeds === 0 &&
                                    !currentContest.has_started,
                                  'bye': pos.name === 'BYE',
                                  'fixed': nbrSeeds > 0 || pos.fixed === true,
                                  'drag-from': pos.id === fromElement.id,
                                  'drag-to': pos.id === toElement.id }"
                >
                  <b-td style="width: 3em" class="text-center">
                    {{ dIndex + 1}}
                  </b-td>
                  <b-td style="width: 100%;">
                    {{ pos.name }}
                  </b-td>
                </b-tr>
              </draggable>
            </b-tbody>
          </b-table-simple>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { apiMixins } from '@/mixins/apiMixins.js'
import draggable from 'vuedraggable'

export default {
  name: 'ContestDraw',
  mixins: [apiMixins],
  data () {
    return {
      drawParticipants: [], // not yet drawn participants (left side of screen)
      nbrParticipants: 0, // total number of participants
      drawTableau: [], // actual draw (right side of screen)
      nbrGroups: 1, // number of groups in drawTableau
      nbrSeeds: 0,  // number of seeded participants
      fromElement: false, // start element of drag
      toElement: false, // final element of drag
      PPANTSTABLE: 'P', // constant for elements in drawParticipants
      DRAWTABLE: 'D', // constant for element in drawTableau
      lastDrawItemId: -1000 // last id for empty slot or byes in drawTableau
    }
  },
  created () {
    this.drawTableau = []
  },
  watch: {
    currentContest: {
      immediate: true,
      deep: true,
      handler: function (newContest) {
        if (newContest) {
          this.nbrSeeds = newContest.ctype_params?.draw_seeds?.length || 0
          this.drawTableau = []
          this.drawParticipants = []
          this.$store.dispatch('loadEmptyDraw', this.emptyDrawParams())
        }
      }
    },
    emptyDrawTableau: {
      immediate: true,
      handler: function (newDraw) {
        if (newDraw) {
          console.log('New empty draw', this.emptyDrawTableau)
          this.setDrawTables()
          this.logDrawTableau('New tableau')
        }
      }
    }
  },
  computed: {
    currentContestType () {
      return this.currentContest.ctype
    },
    emptyDrawTableau () {
      return this.$store.getters.emptyDraw
    }
  },
  methods: {
    // actualize draw tables
    setDrawTables () {
      this.setDrawParticipants()
      this.setDrawTableau()
      this.expandEmptyDrawParticipants()
    },
    //
    // Process drawParticipants
    //
    setDrawParticipants () {
      this.drawParticipants = this.currentParticipants.map(
        (p, i) => this.getParticipantDrawItem(p, this.PPANTSTABLE, null, i)
      )
      this.drawParticipants.sort((a, b) =>
        (a.seed || 999) - (b.seed || 999))
      this.nbrParticipants = this.currentParticipants.length
    },
    getParticipantDrawItem (pos, table, group, i) {
      return {
        id: pos.id,
        name: pos.name,
        shortname: pos.shortname,
        table: table,
        group: group,
        pos: i,
        seed: pos.seed_position, // i < this.nbrSeeds ? i + 1 : null,
        seedsuffix: pos.seed_position ? ` (${pos.seed_position})` : ''
      }
    },
    // add placeholder participant as target for draggable component
    // if drawParticipants is empty
    expandEmptyDrawParticipants () {
      if (this.drawParticipants.length === 0) {
        this.drawParticipants.push(
          this.getSpecialDrawItem('', this.PPANTSTABLE, null, -1)
        )
      }
    },
    // drawParticipants empty or 1 placeholder entry
    drawParticipantsEmpty () {
      return this.drawParticipants.length === 0 ||
        (this.drawParticipants.length === 1 &&
          this.drawParticipants[0].pos === -1)
    },
    moveItemToParticipants (item, pos = undefined) {
      if (item.id <= '' || this.nbrSeeds > 0) {
        return
      }
      if (this.drawParticipantsEmpty()) {
        this.drawParticipants = [item] // handles empty and placeholder case
      } else if (pos) {
        this.drawParticipants.splice(pos, 0, item) // insert at pos
      } else {
        this.drawParticipants.push(item)
      }
    },
    removeParticipant (id) {
      const ppantPos = this.drawParticipants.findIndex(p => p.id === id)
      if (ppantPos >= '') {
        this.drawParticipants.splice(ppantPos, 1)
      }
    },
    resetParticipantsSeed (nbrSeeds) {
      this.drawParticipants.forEach(function (p, i) {
        p.seed = i < nbrSeeds ? i + 1 : null,
        p.seedsuffix = i < nbrSeeds ? ` (${i + 1})` : ''
      })
      return true
    },
    resetParticipantsPos (nbrSeeds) {
      this.drawParticipants.forEach(function (p, i) {
        p.table = 'P'
        p.group = null
        p.pos = p.pos === -1 ? -1 : i
        p.seed = i < nbrSeeds ? i + 1 : null,
        p.seedsuffix = i < nbrSeeds ? ` (${i + 1})` : ''
      })
      this.expandEmptyDrawParticipants()
    },
    //
    // Process drawTableau
    //
    setDrawTableau () {
      const params = this.currentContest.ctype_params
      if (params && params.draw_tableau && params.draw_tableau.length > 0 &&
          this.drawTableau.length === 0) {
        // at start: load actual drawTableau from contest, if it exists
        this._drawTableau = Object.assign([], params.draw_tableau)
      } else {
        // no saved draw, changed number of seeds, groups or group size:
        // use standard empty tableau
        this._drawTableau = Object.assign([], this.emptyDrawTableau)
      }
      this.drawTableau = []
      // replace participantIds, zeros and 'BYE' by drawItem objects
      this._drawTableau.forEach((group, groupIndex) => {
        const _group = group.map((posId, posIndex) =>
          this.mapParticipantToDraw(posId, groupIndex, posIndex))
        this.drawTableau.push(_group)
      })
      this.nbrGroups = this.drawTableau.length
    },
    // drawTableau items for empty slots (name == '') or byes ('BYE')
    getSpecialDrawItem (name, table, group, index) {
      this.lastDrawItemId -= 1
      return {
        id: this.lastDrawItemId,
        name: name,
        shortname: name,
        table: table,
        group: group,
        pos: index,
        fixed: name === ''
      }
    },
    mapParticipantToDraw (pId, groupIndex, posIndex) {
      let drawItem = {}
      if (pId === 'BYE') {
        drawItem = this.getSpecialDrawItem('BYE', this.DRAWTABLE, groupIndex, posIndex)
      } else if (pId === '' || pId === 0) {
        drawItem = this.getSpecialDrawItem('', this.DRAWTABLE, groupIndex, posIndex)
      } else {
        const ppantIndex = this.drawParticipants.findIndex(
          p => p.id === pId.toString())
        if (ppantIndex < '') {
          return {}
        }
        drawItem = this.getParticipantDrawItem(
          this.drawParticipants[ppantIndex],
          this.DRAWTABLE, groupIndex, posIndex
        )
        if (this.nbrSeeds === 0) {
          // With seeds, the participant list is always shown
          this.drawParticipants.splice(ppantIndex, 1)
        }
      }
      return drawItem
    },
    resetDrawTableau () {
      if (this.nbrSeeds > 0) {
        this.drawTableau.forEach((group, groupIndex) => {
          group.forEach((pos, posIndex) => {
            if (pos.name !== 'BYE') {
              group[posIndex] =
                this.getSpecialDrawItem('', this.DRAWTABLE, group, groupIndex)
            }
          })
        })
      }
    },
    mapToEmptyItem (group, groupIndex) {
      group.map(p => {
            if (p.name === 'BYE') {
              p
            } else {
              this.getSpecialDrawItem('', this.DRAWTABLE, group, groupIndex)
            }
         })
    },
    resetDrawTableauPos () {
      this.drawTableau.forEach((group, groupIndex) => {
        group.forEach((p, i) => {
          p.table = 'D'
          p.group = groupIndex
          p.pos = i
        })
      })
    },
    //
    // Process seed changes (number)
    //
    moreSeedsDisabled () {
      return this.currentContest.has_started ||
        this.currentContestType == 'KO' ?
          this.nbrSeeds > Math.floor(this.nbrParticipants / 2) :
          (this.nbrGroups < 2 || this.nbrSeeds === this.nbrGroups)
    },
    lessSeedsDisabled () {
      return this.currentContest.has_started || this.nbrSeeds === 0
    },
    moreSeeds () {
      if (!this.moreSeedsDisabled()) {
        if (this.nbrSeeds === 0) {
          this.setDrawParticipants()
          this.nbrSeeds = 2
        } else if (this.currentContestType === 'KO') {
          this.nbrSeeds *= 2
        } else {
          this.nbrSeeds += 1
        }
        this.resetParticipantsPos(this.nbrSeeds)
        this.resetDrawTableau()
      }
    },
    lessSeeds () {
      if (!this.lessSeedsDisabled()) {
        if (this.nbrSeeds === 2) {
          this.nbrSeeds = 0
        } else if (this.currentContestType === 'KO') {
          this.nbrSeeds /= 2
        } else {
          this.nbrSeeds -= 1
        }
        this.resetParticipantsPos(this.nbrSeeds)
        this.setDrawTableau()
      }
    },
    //
    // Process group changes (number, size)
    //
    moreGroupsDisabled () {
      return this.currentContest.has_started ||
        this.nbrGroups >= Math.floor(this.nbrParticipants / 2)
    },
    lessGroupsDisabled () {
      return this.currentContest.has_started || this.nbrGroups === 1
    },
    moreGroups () {
      if (!this.moreGroupsDisabled()) {
        this.drawTableau.push([])
        this.nbrGroups += 1
        this.$store.dispatch('loadEmptyDraw', this.emptyDrawParams())
      }
    },
    lessGroups () {
      if (!this.lessGroupsDisabled()) {
        this.nbrGroups -= 1
        while (this.drawTableau[this.nbrGroups].length > 0) {
          const item = this.drawTableau[this.nbrGroups].shift()
          this.moveItemToParticipants(item)
        }
        this.resetParticipantsPos(this.nbrSeeds)
        this.drawTableau.pop()
        if (this.drawTableau.length < this.nbrSeeds) {
          this.lessSeeds()
        }
        this.$store.dispatch('loadEmptyDraw', this.emptyDrawParams())
      }
    },
    smallerGroupDisabled (group) {
      return this.currentContest.has_started ||
        !this.drawTableau[group] ||
        this.drawTableau[group].length <= 2
    },
    biggerGroupDisabled (group) {
      return this.currentContest.has_started ||
        !this.drawTableau[group] ||
        (this.nbrParticipants - this.drawTableau[group].length - 1 <
          (this.drawTableau.length - 1) * 2)
    },
    smallerGroup (group) {
      if (!this.smallerGroupDisabled(group)) {
        const item = this.drawTableau[group].pop()
        this.moveItemToParticipants(item)
        this.resetParticipantsPos(this.nbrSeeds)

        const biggerGroup = (group + 1) % this.nbrGroups
        this.drawTableau[biggerGroup].push(this.getSpecialDrawItem(
          '', this.DRAWTABLE, biggerGroup, this.drawTableau[biggerGroup].length))
        this.resetDrawTableau()
      }
    },
    biggerGroup (group) {
      if (!this.biggerGroupDisabled(group)) {
        this.drawTableau[group].push(this.getSpecialDrawItem(
          '', this.DRAWTABLE, group, this.drawTableau[group].length))
        this.reduceNextPossibleGroup(group, 1)
        this.resetDrawTableau()
      }
    },
    reduceNextPossibleGroup (group, nbr = 1) {
      for (let nextGroup = (group + 1) % this.nbrGroups;
        nextGroup !== group && nbr > 0;
        nextGroup = (nextGroup + 1) % this.nbrGroups) {
        while (this.drawTableau[nextGroup].length > 2 && nbr > 0) {
          const item = this.drawTableau[nextGroup].pop()
          this.moveItemToParticipants(item)
          nbr -= 1
        }
      }
      this.resetParticipantsPos(this.nbrSeeds)
    },
    //
    // Process save and delete of draws
    //
    callConfirmed (action) {
      const actions = {
        'save': { verb: 'replace', func: this.createDraw },
        'delete': { verb: 'delete', func: this.removeDraw } }

      if (! this.currentContest.has_draw) {
        actions[action].func()  // no confirmation necessary
        return
      }
      // this.boxOne = ''
      this.$bvModal.msgBoxConfirm(
        `Do you really want to ${actions[action].verb} the existing draw? This will also ${actions[action].verb} all current matches!`
      )
        .then(okResponse => {
          if (okResponse) {
            actions[action].func()
          }
        })
        .catch(error => {
          this.setError(error, 'Error displaying message box')
        })
    },
    removeDraw () {
      const path = `/api/v1/contests/${this.currentContest.id}/draw`
      this.callAxiosDelete(path, 'delete', 'Draw')
      this.drawTableau = this.drawTableau.map(() => [])
    },
    createDraw () {
      const path = `/api/v1/contests/${this.currentContest.id}/draw`
      this.callAxiosAdd(path, 'save', 'Draw', null,
        this.drawParams(),
        'Saving draw and creating matches...')
    },
    emptyDrawParams () {
      let tableau = []
      if (this.drawTableau.length === 0 || this.drawTableau[0].length === 0) {
        if (this.currentContest.ctype_params &&
            this.currentContest.ctype_params['draw_tableau']) {
          tableau = this.currentContest.ctype_params['draw_tableau'].map(() => [])
        } else {
          tableau = [[]]
        }
      } else {
        tableau = this.drawTableau.map(() => [])
      }
      return {
        data: {
          type: "draw",
          id: this.currentContest.id,
          attributes: { draw_tableau: tableau }
        }
      }
    },
    drawParams () {
      const tableau = this.drawTableau.map(g => g.map(this.getTableauPos))
      let seeds = []
      for (let index = 0; index < this.nbrSeeds; index++) {
        seeds.push(Number(this.drawParticipants[index].id))
      }
      return { draw: { draw_tableau: tableau, draw_seeds: seeds } }
    },
    getTableauPos (p) {
      if (p) {
        return p.id > '' ? Number(p.id) : (p.name === '' ? 0 : p.name)
      }
      return 0
    },
    //
    // Process 'draggable' events
    //
    // Move handler: constantly sends 'from' and current 'to' position of drag
    handleMove (evt) {
      this.fromElement = evt.draggedContext.element
      if (evt.relatedContext && evt.relatedContext.element) {
        if (!evt.relatedContext.element.id) {
          this.toElement = false
          console.log('!!! INVALID ELEMENT in drawTableau !!!', evt)
        } else if (this.toElement.id !== evt.relatedContext.element.id) {
          this.toElement = evt.relatedContext.element
          console.log('moved to new element', this.logDrag())
        }
      } else if (this.toElement) {
        this.toElement = false
        console.log('no Element at to-Position!', evt)
      }
      console.log('handleMove', this.logDrag())

      // built-in drag processing within drawParticipants
      return (this.fromElement.table === 'P' && this.toElement.table === 'P')
    },
    // Replacement for the default drag handler of 'draggable'
    handleDragEnd () {
      console.log('handleDragEnd', this.logDrag())
      const from = this.fromElement
      const to = this.toElement

      if (!from || !to || (from.table === 'P' && to.table === 'P')) {
        // Within drawParticipants: default sort handling of draggable
      } else if (from.table === 'D' && to.table === 'D') {
        // Within drawTableau: swap instead of move/sort
        const _drawTableau = Object.assign([], this.drawTableau)
        _drawTableau[from.group][from.pos] = to
        _drawTableau[to.group][to.pos] = from
        this.drawTableau = _drawTableau
      } else if (from.table === 'P' && to.table === 'D') {
        // fromTable: remove participant, toTable: replace empty slot
        // or swap participant and already filled slot
        if (this.drawTableau[to.group][to.pos].name !== 'BYE') {
          if (this.drawTableau[to.group][to.pos].id > '') {
            this.drawParticipants.push(to)
          }
          this.drawTableau[to.group][to.pos] = from
          this.removeParticipant(from.id)
        }
      } else if (from.table === 'D' && to.table === 'P') {
        // fromTable: replace by empty slot, toTable: insert
        if (this.drawTableau[from.group][from.pos].name !== 'BYE') {
          this.drawTableau[from.group][from.pos] =
            this.getSpecialDrawItem('', this.DRAWTABLE, from.group, from.pos)
          this.moveItemToParticipants(from, to.pos)
        }
      }
      this.resetParticipantsPos(this.nbrSeeds)
      this.resetDrawTableauPos()
      this.fromElement = false
      this.toElement = false
      this.logDrawTableau('After dragEnd')
    },
    //
    // Log helpers
    //
    logDrawTableau (m = '') {
      console.log(m, this.drawTableau.map(group => group.map(p => p.shortname)))
    },
    logDrag () {
      return this.fromElement.table + '-' + this.fromElement.shortname + '-' +
        this.fromElement.group + '-' + this.fromElement.pos +
        ' => ' + this.toElement.table + '-' + this.toElement.shortname + '-' + this.toElement.group + '-' + this.toElement.pos
    }
  },
  components: {
    draggable
  }
}
</script>

<style>
.item {
  cursor: move;
}
.drag-from {
  background-color: lightgrey;
  opacity: 0.2;
}
.drag-to {
  background-color: lightgrey;
}
.sortable-drag {
  background-color: lightgrey;
  opacity: 0.5;
}
.empty-slot {
  height: 0.5em;
}
.bye {
  background-color: grey;
}
</style>
