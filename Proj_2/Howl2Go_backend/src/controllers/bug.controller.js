import Bug from '../models/Bug.js';

/**
 * Create a bug report
 * POST /api/bugs
 */
export const createBugReport = async (req, res) => {
  try {
    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      assignedTo
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity level'
      });
    }

    // Validate assignedTo if provided
    const validDevelopers = ['Anandteertha', 'Advait', 'Adit', 'Kavya'];
    if (assignedTo && !validDevelopers.includes(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid developer assignment'
      });
    }

    // Get user info if authenticated
    let reportedBy = null;
    let reportedByEmail = '';
    let reportedByName = 'Anonymous';

    if (req.user) {
      reportedBy = req.user.id;
      reportedByEmail = req.user.email || '';
      reportedByName = req.user.name || 'User';
    }

    // Create bug report
    const bug = await Bug.create({
      title,
      description,
      stepsToReproduce: stepsToReproduce || '',
      expectedBehavior: expectedBehavior || '',
      actualBehavior: actualBehavior || '',
      severity: severity || 'medium',
      assignedTo: assignedTo || '',
      reportedBy,
      reportedByEmail,
      reportedByName
    });

    res.status(201).json({
      success: true,
      message: 'Bug report submitted successfully',
      data: {
        bug
      }
    });
  } catch (error) {
    console.error('Error creating bug report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bug report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all bug reports (admin only)
 * GET /api/bugs
 */
export const getBugReports = async (req, res) => {
  try {
    // Check if user is authenticated and is admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, assignedTo, severity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (severity) query.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bugs = await Bug.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Bug.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bugs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bug reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

