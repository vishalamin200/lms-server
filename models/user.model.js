import bcrypt from 'bcrypt';
import crypto from 'crypto';
import JWT from 'jsonwebtoken';
import mongoose, { Schema } from "mongoose";
import courseModel from './course.model.js';


const userSchema = new Schema({

    googleId: {
        type: String,
        unique: true,
    },

    fullName: {
        type: String,
        trim: true,
        minlength: [2, "Name is too short"],
        maxlength: [30, "Name is too long"],
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "Enter valid Email"]
    },

    contact: {
        type: String,
        trim: true,
        default: ""
    },

    linkedin: {
        type: String,
        trim: true,
        default: ""
    },

    address: {
        type: String,
        trim: true,
        default: ""
    },

    password: {
        type: String,
        minlength: [6, "Password should have atleast 6 characters"],
        select: false
    },

    role: {
        type: String,
        enum: ['USER', 'INSTRUCTOR', 'ADMIN'],
        default: "USER"
    },

    avatar: {
        public_id: {
            type: String,
            default: ""
        },
        secure_url: {
            type: String,
            default: "https://res.cloudinary.com/dqtkulbwd/image/upload/v1723902171/Profile%20Picture/accfigp4wynlmdz9zajd.webp"
        }
    },

    subscriptions: [
        {
            courseId: {
                type: String,
                unique:true,
            },
            courseTitle: {
                type: String,
                trim: true,
            },
            subscription_id: {
                type: String,
                default: ""
            },
            order_id: {
                type: String,
                default: ""
            },
            subscription_status: {
                type: String,
                default: "Inactive"
            },

            purchaseAt: {
                type: Date,
            },
            expiresAt: {
                type: Date,
            },
            paymentDetails: {
                type: Object
            }
        }
    ],

    createdCourses: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: courseModel,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now()
            },
        }
    ],

    forgetPasswordToken: String,

    forgetPasswordExpiry: Date

}, {
    timestamps: true,
    autoIndex: false,
})

userSchema.pre("save", async function (next) {
    // if password is not modified and have same as previous don't encryt it again
    if (!this.isModified('password')) {
        return next()
    }

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()

    } catch (error) {
        console.error("Error in Encrypting the password : ", error.message)
        next(error)
    }
})

userSchema.methods = {
    async comparePassword(textPassword) {
        try {
            if(this.password){
                let result = await bcrypt.compare(textPassword, this.password)
                return result
            }else{ 
                console.log("Google Auth Account")
                return false
            }
        }catch (error) {
            console.error("Error In Comparing Paswords: ", error.message)
        }
    },

    generateJwtToken() {
        return JWT.sign({ id: this._id, fullName: this.fullName, email: this.email, role: this.role, subscription: this.subscription },
            process.env.JWT_SECRET_KEY,
            {
                // algorithm:'RS256',
                expiresIn: '3 days'
            }
        )
    },

    async resetPasswordToken() {
        try {
            const token = crypto.randomBytes(32).toString('hex')

            // Encrypt the token and store this token inside the user's database for later use
            const salt = await bcrypt.genSalt(10)
            this.forgetPasswordToken = await bcrypt.hash(token, salt)
            this.forgetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000)

            //Save all information we updated
            await this.save()

            //return the token we have generate
            return token;

        } catch (error) {
            console.error("Error in Generating Reset Password Token")
            throw error
        }
    },

    async validateToken(token) {
        try {
            // As token inside the databased is encrypted so we will encrypt the token and then find the correspoding user docuemts
            const isValidToken = await bcrypt.compare(token, this.forgetPasswordToken)
            const isTokenExpired = this.forgetPasswordExpiry > Date.now()

            return (isValidToken && isTokenExpired)

        } catch (error) {
            console.error("Error in Validating the Reset Password Token", error.message)
        }
    } 
}


const userModel = mongoose.model('users', userSchema)

async function getIndexes() {
    try {
        // Step 1: Get existing indexes
        const indexes = await userModel.collection.indexes();
        // console.log("UserModel Indexes:", indexes);

    } catch (error) {
        console.error("Error handling indexes:", error.message);
    }
}

// getIndexes();



export default userModel


