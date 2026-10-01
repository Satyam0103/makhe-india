import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminDocument extends Document {
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: {
      type: String,
      required: [true, 'Admin email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required.'],
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Method to verify password against stored hash safely
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const AdminModel = mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
export default AdminModel;
