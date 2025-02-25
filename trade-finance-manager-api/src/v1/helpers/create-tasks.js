const CONSTANTS = require('../../constants');

const NEW_TASK = {
  status: CONSTANTS.TASKS.STATUS.CANNOT_START,
  assignedTo: {
    userId: CONSTANTS.TASKS.UNASSIGNED,
    userFullName: CONSTANTS.TASKS.UNASSIGNED,
  },
  canEdit: false,
  history: [],
};

/**
 * Create tasks for a single group
 * @param {Array} tasks to add to a group
 * @param {Number} group ID
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created tasks
 */
const createGroupTasks = (tasks, groupId, additionalTasks = []) => {
  const mappedTasks = [];
  let taskIdCount = 0;

  tasks.forEach((t) => {
    let task = t;

    /**
     * Only create the task if:
     * - task title is NOT conditional and always applies.
     * - OR the task is conditional and the task title is listed in additionalTasks array
     */
    const shouldCreateTask = !task.isConditional || (task.isConditional && additionalTasks.includes(task.title));

    if (shouldCreateTask) {
      // do not rely on index - otherwise if a task is conditional,
      // we can end up with e.g id 1 then skipping to id 3
      taskIdCount += 1;

      task = {
        id: String(taskIdCount),
        groupId,
        ...task,
        ...NEW_TASK,
      };

      // only the first task in the first group can be started/edited straight away.
      if (groupId === 1 && taskIdCount === 1) {
        task.canEdit = true;
        task.status = CONSTANTS.TASKS.STATUS.TO_DO;
      }

      mappedTasks.push(task);
    }
  });

  return mappedTasks;
};

/**
 * Create AIN tasks/task groups
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created task groups
 */
const createTasksAIN = (additionalTasks) => [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(CONSTANTS.TASKS.AIN.GROUP_1.TASKS, 1, additionalTasks),
  },
];

/**
 * Create MIA tasks/task groups
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created task groups
 */
const createTasksMIA = (additionalTasks) => [
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_1.TASKS, 1, additionalTasks),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_2.TASKS, 2, additionalTasks),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_3.TASKS, 3, additionalTasks),
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: createGroupTasks(CONSTANTS.TASKS.MIA.GROUP_4.TASKS, 4, additionalTasks),
  },
];

/**
 * Create tasks/task groups depending on the deal type
 * @param {String} deal submission type
 * @param {Array} additional/special tasks to add to the group
 * @returns {Array} created task groups
 */
const createTasks = (submissionType, additionalTasks) => {
  let tasks = [];

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    tasks = createTasksAIN(additionalTasks);
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    tasks = createTasksMIA(additionalTasks);
  }

  return tasks;
};

module.exports = {
  NEW_TASK,
  createGroupTasks,
  createTasksAIN,
  createTasksMIA,
  createTasks,
};
