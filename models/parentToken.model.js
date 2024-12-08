import mongoose from 'mongoose';

const parentTokenSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Parent'
    },
    token: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const ParentToken = mongoose.model('ParentToken', parentTokenSchema);
export default ParentToken;
