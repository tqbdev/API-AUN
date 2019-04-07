module.exports = {
  ENUM: {
    STATUS: {
      TODO: 'TODO',
      DOING: 'DOING',
      DONE: 'DONE',
      REVIEWED: 'REVIEWED'
    },
    SUGGESTION_TYPE: {
      IMPLICATION: 'IMPLICATION',
      QUESTION: 'QUESTION',
      EVIDENCE: 'EVIDENCE'
    },
    ROLE: {
      ADMIN: 'ADMIN',
      EDITOR: 'EDITOR',
      REVIEWER: 'REVIEWER'
    },
    EVIDENCE_TYPE: {
      LINK: 'LINK',
      FILE: 'FILE'
    }
  },
  PATTERN: {
    EVIDENCE: /(<a[\w\d\s]*href=["']{1}((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=//]*))["']{1}.*)(data-value=["'].*["'])(.*>)(.*)(<\/a>)/gu
  }
};
