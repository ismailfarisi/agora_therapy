/**
 * Database Type Definitions
 * Central export for all database types
 * 
 * Note: All types are now organized in separate model files
 * under src/types/models/ for better maintainability
 * 
 * Import from here to maintain backward compatibility:
 * import { User, Appointment, etc. } from '@/types/database';
 */

// Re-export all types from models
export * from './models';
