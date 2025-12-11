import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Siuno Futbol API',
      version: '1.0.0',
      description: 'Soccer Team Management Application - Complete Backend API',
      contact: {
        name: 'API Support',
        email: 'support@siunofutbol.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.siunofutbol.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'dob', 'position', 'phone'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'Full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              description: 'Password (min 6 characters)'
            },
            dob: {
              type: 'string',
              format: 'date',
              description: 'Date of birth'
            },
            position: {
              type: 'string',
              enum: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'],
              description: 'Player position'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            role: {
              type: 'string',
              enum: ['Leader', 'Treasurer', 'Member'],
              default: 'Member',
              description: 'Team role'
            },
            debt: {
              type: 'number',
              default: 0,
              description: 'Current debt amount'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Account status'
            },
            teamId: {
              type: 'string',
              description: 'Team ID'
            }
          }
        },
        Team: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            inviteCode: {
              type: 'string',
              description: 'Unique invite code'
            },
            monthlyFeeAmount: {
              type: 'number',
              description: 'Monthly fee per member'
            },
            currentFundBalance: {
              type: 'number',
              description: 'Current team fund balance'
            }
          }
        },
        Match: {
          type: 'object',
          required: ['time', 'location', 'opponentName', 'votingDeadline'],
          properties: {
            id: {
              type: 'string'
            },
            time: {
              type: 'string',
              format: 'date-time',
              description: 'Match date and time'
            },
            location: {
              type: 'string',
              description: 'Match venue'
            },
            opponentName: {
              type: 'string',
              description: 'Opponent team name'
            },
            contactPerson: {
              type: 'string',
              description: 'Contact person'
            },
            votingDeadline: {
              type: 'string',
              format: 'date-time',
              description: 'Vote submission deadline'
            },
            isLocked: {
              type: 'boolean',
              default: false,
              description: 'Match locked status'
            },
            matchCost: {
              type: 'number',
              description: 'Total match cost'
            },
            totalParticipants: {
              type: 'number',
              description: 'Total participants (members + guests)'
            },
            guestCount: {
              type: 'number',
              description: 'Number of guests'
            }
          }
        },
        Vote: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['Participate', 'Absent', 'Late'],
              description: 'Vote status'
            },
            note: {
              type: 'string',
              description: 'Optional note'
            },
            isApprovedChange: {
              type: 'boolean',
              description: 'Post-deadline change approval'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Transaction amount'
            },
            type: {
              type: 'string',
              enum: ['FundCollection', 'Expense', 'GuestPayment', 'MatchExpense', 'MonthlyFee'],
              description: 'Transaction type'
            },
            description: {
              type: 'string',
              description: 'Transaction description'
            },
            proofImage: {
              type: 'string',
              description: 'Cloudinary URL of proof image'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error description'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Team',
        description: 'Team creation and management'
      },
      {
        name: 'Matches',
        description: 'Match scheduling and voting'
      },
      {
        name: 'Finance',
        description: 'Financial operations (Leader/Treasurer only)'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
