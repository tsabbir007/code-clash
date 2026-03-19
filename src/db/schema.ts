import { boolean, pgTable, text, timestamp, integer, serial } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

// Problem Management Tables
export const category = pgTable("category", {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3b82f6'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const problemCategory = pgTable("problem_category", {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => category.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const problem = pgTable("problem", {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  statement: text('statement'),
  description: text('description'),
  difficulty: text('difficulty').default('Easy'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  timeLimit: integer('time_limit').default(1000), // milliseconds
  memoryLimit: integer('memory_limit').default(256), // kilobytes
  checkerType: text('checker_type').default('fcmp'),
  customChecker: text('custom_checker'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const problemModerator = pgTable("problem_moderator", {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  addedBy: text('added_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const testCase = pgTable("test_case", {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  input: text('input').notNull(),
  output: text('output').notNull(),
  points: integer('points').default(1),
  isSample: boolean('is_sample').default(false),
  addedBy: text('added_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const solution = pgTable("solution", {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  note: text('note'),
  language: text('language').notNull(),
  sourceCode: text('source_code').notNull(),
  verdict: text('verdict').default('Pending'),
  cpuTime: integer('cpu_time').default(0),
  memoryUsage: integer('memory_usage').default(0),
  addedBy: text('added_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const submission = pgTable("submission", {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  sourceCode: text('source_code').notNull(),
  verdict: text('verdict').default('Pending'),
  cpuTime: integer('cpu_time').default(0),
  memoryUsage: integer('memory_usage').default(0),
  score: integer('score').default(0),
  testCasesPassed: integer('test_cases_passed').default(0),
  totalTestCases: integer('total_test_cases').default(0),
  type: text('type').default('Practice'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const submissionResult = pgTable("submission_result", {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').notNull().references(() => submission.id, { onDelete: 'cascade' }),
  testCaseId: integer('test_case_id').notNull().references(() => testCase.id, { onDelete: 'cascade' }),
  verdict: text('verdict').notNull(), // AC, WA, TLE, MLE, CE, RE
  cpuTime: integer('cpu_time').default(0),
  memoryUsage: integer('memory_usage').default(0),
  output: text('output'),
  expectedOutput: text('expected_output'),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

// Contest Management Tables (for future use)
export const contest = pgTable("contest", {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isPublic: boolean('is_public').default(false),
  createdBy: text('created_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const contestProblem = pgTable("contest_problem", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  points: integer('points').default(100),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const contestParticipant = pgTable("contest_participant", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const contestModerator = pgTable("contest_moderator", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  permissions: text('permissions').default('full'), // full, limited, read-only
  addedBy: text('added_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const contestAnnouncement = pgTable("contest_announcement", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isImportant: boolean('is_important').default(false),
  createdBy: text('created_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const contestClarification = pgTable("contest_clarification", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').references(() => problem.id, { onDelete: 'cascade' }), // null for general questions
  question: text('question').notNull(),
  answer: text('answer'),
  status: text('status').default('pending'), // pending, answered, dismissed
  askedBy: text('asked_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  answeredBy: text('answered_by').references(() => user.id, { onDelete: 'cascade' }),
  askedAt: timestamp('asked_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  answeredAt: timestamp('answered_at'),
  isPublic: boolean('is_public').default(false) // whether other participants can see this
});

export const contestSubmission = pgTable("contest_submission", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  sourceCode: text('source_code').notNull(),
  verdict: text('verdict').default('Pending'),
  cpuTime: integer('cpu_time').default(0),
  memoryUsage: integer('memory_usage').default(0),
  score: integer('score').default(0),
  testCasesPassed: integer('test_cases_passed').default(0),
  totalTestCases: integer('total_test_cases').default(0),
  submissionTime: timestamp('submission_time').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  submissionId: integer('submission_id').references(() => submission.id, { onDelete: 'cascade' }) // Reference to regular submission
});

export const contestStanding = pgTable("contest_standing", {
  id: serial('id').primaryKey(),
  contestId: integer('contest_id').notNull().references(() => contest.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  totalScore: integer('total_score').default(0),
  problemsSolved: integer('problems_solved').default(0),
  penalty: integer('penalty').default(0),
  lastSubmissionTime: timestamp('last_submission_time'),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});


