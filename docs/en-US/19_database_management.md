# Database Management 🗄️

**mAI** manages its data storage in a structured and highly performant manner to guarantee fast, offline access to your conversations and configurations.

## Storage Architecture

Depending on the runtime environment (Desktop or Web), mAI utilizes different storage engines:
- **Desktop Application**: Uses a lightweight local database (SQLite) stored in the application's user directory. It guarantees excellent read/write performance for large history volumes.
- **Web Application**: Relies on the browser's internal database (IndexedDB) or external API services synchronized with a PostgreSQL database if cloud mode is enabled.

## Schema Migrations

mAI includes an automatic database schema migration system. With every application update, if the database structure changes (e.g., adding a new field to agents or messages), migrations run seamlessly at startup without altering your existing data.

## Performance Optimization

To keep the application fast:
- **Automatic Cleanup**: Temporary messages or expired sessions can be pruned periodically.
- **Indexing**: Conversation messages are indexed to allow near-instantaneous text search.
