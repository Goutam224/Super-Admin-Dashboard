const app = require('./src/app');
const sequelize = require('./src/models/index');
const { initAssociations } = require('./src/models/associations');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Initialize model associations
    initAssociations();
    
    // Sync database (create tables)
    await sequelize.sync();
    console.log('✅ Database synchronized.');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Health Check: http://localhost:${PORT}/health`);
      console.log(`🎯 Frontend should connect to: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();