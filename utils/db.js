const isEqual = require('date-fns/isEqual')
require("dotenv").config();

const mongoose = require('mongoose');
mongoose.connect('mongodb://bx24in.space:27017/timesheetsblocks', {useNewUrlParser: true, useUnifiedTopology: true});

const mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, 'connection error:'));
mongodb.once('open', function(msg) {
    // we're connected!
    console.log("Mongoose connected: ", msg);
});

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    longMeters: {
        type: Number,
        required: false
    }
});

const orderSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
        unique: true
    },
    product: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

const lunchSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
});

const activitySchema =  new mongoose.Schema({
    order: Number,
    product: String,
    count: Number,
    isPartial: {
        type: Boolean,
        required: false
    }
});

const activitiesBlockSchema =  new mongoose.Schema({
    datetime: {
        type: Date,
        required: false
    },
    datetimeStart: {
        type: Date,
        required: false
    },
    datetimeEnd: {
        type: Date,
        required: false
    },
    activities: [ activitySchema ],
    process: String,
    materials: {
        type: [ materialSchema ],
        required: false
    },
    mate: {
        type: String,
        required: false
    },
    isMate: {
        type: Boolean,
        required: false
    },
    plotter: {
        type: Number,
        required: false
    }
});

const aloneActivitiesBlockSchema =  new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        required: false
    },
    datetimeStart: {
        type: Date,
        required: false
    },
    datetimeEnd: {
        type: Date,
        required: false
    },
    activities: [ activitySchema ],
    process: String,
    materials: {
        type: [ materialSchema ],
        required: false
    },
    mate: {
        type: String,
        required: false
    },
    isMate: {
        type: Boolean,
        required: false
    },
    plotter: {
        type: Number,
        required: false
    }
});

const tourSchema= new mongoose.Schema({
    activitiesBlocks: {
        type: [ activitiesBlockSchema ],
        required: false
    },
    userId: {
        type: String,
        required: false
    },
    userName: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    lunch: {
        type: [ lunchSchema ],
        required: false
    },
    isnight: {
        type: Boolean,
        required: false
    },
    department: {
        type: String,
        required: false
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pushToken: {
        type: String,
        required: false,
        unique: true
    }
});

const Tour = mongoose.model('Tour', tourSchema);
const Order = mongoose.model('Order', orderSchema);
const AloneActivitiesBlock = mongoose.model('AloneActivitiesBlock', aloneActivitiesBlockSchema);

const User = mongoose.model('User', userSchema);

class Db {

    static getAllTours = async () => {
        let items;
        try {
            items = await Tour.find({}).exec();
        } catch (e) {
            console.log("Getting all tours error: ", e);
            return false;
        }
        return items;
    };

    static getToursByPeriod = async (dateStart, dateEnd) => {
        let items;
        const startOfPeriod = new Date(dateStart);
        // startOfPeriod.setHours(0,0,0,0);
        const endOfPeriod = new Date(dateEnd);
        // endOfPeriod.setHours(23,59,59,999);
        try {
            items = await Tour.find({
                start: {"$gte": startOfPeriod, "$lt": endOfPeriod}
            }).exec();
        } catch (e) {
            console.log("Getting tours by period error: ", e);
            return false;
        }
        return items;
    };

    static getToursByPeriodAndUser = async (name, dateStart, dateEnd) => {
        let items;
        const startOfPeriod = new Date(dateStart);
        startOfPeriod.setHours(0,0,0,0);
        const endOfPeriod = new Date(dateEnd);
        endOfPeriod.setHours(23,59,59,999);
        try {
            if(name === process.env.ADMIN_USER) {
                items = await Tour.find({}).exec();
            } else {
                items = await Tour.find({
                    userName: name,
                    start: {"$gte": startOfPeriod, "$lt": endOfPeriod}
                }).exec();
            }
        } catch (e) {
            console.log("Getting tours error: ", e);
            return false;
        }
        return items;
    };

    static getOrders = async () => {
        let items;
        try {
            items = await Order.find({}).exec();
        } catch (e) {
            console.log("Getting orders error: ", e);
            return false;
        }
        console.log("Got orders count: ", items.length);
        return items;
    };

    static getAloneActivitiesBlocks = async () => {
        let items;
        try {
            items = await AloneActivitiesBlock.find({}).exec();
        } catch (e) {
            console.log("Getting alone activitiesBlocks error: ", e);
            return false;
        }
        console.log("Got alone activitiesBlocks count: ", items.length);
        return items;
    };

    static getTourById = async (tourId) => {
        let tourObj;
        try {
            tourObj = await Tour.findById(tourId).exec();
        } catch (e) {
            console.log("Getting tour error: ", e);
            return false;
        }
        return tourObj;
    };

    static getAloneActivitiesBlockById = async (aloneActivitiesBlockId) => {
        let aloneActivitiesBlockObj;
        try {
            aloneActivitiesBlockObj = await AloneActivitiesBlock.findById(aloneActivitiesBlockId).exec();
        } catch (e) {
            console.log("Getting alone activitiesBlock error: ", e);
            return false;
        }
        return aloneActivitiesBlockObj;
    };

    static getOrderById = async (orderId) => {
        let orderObj;
        try {
            orderObj = await Order.findById(orderId).exec();
        } catch (e) {
            console.log("Getting order error: ", e);
            return false;
        }
        return orderObj;
    };

    static getUserById = async (userId) => {
        let userObj;
        try {
            userObj = await User.findById(userId).exec();
        } catch (e) {
            console.log("Getting user error: ", e);
            return false;
        }
        return userObj;
    };

    static addTour = async (dataObj) => {
        console.log("Gonna save tour: ", dataObj);
        let result;
        try {
            const newItem = new Tour(dataObj);
            result = await newItem.save();
            console.log("Tour added with result: ", result);
            console.log("Saved tour: ", await Db.getTourById(result._id));
        } catch(err) {
            console.log("Tour adding error: ", err);
            result = false;
        }
        return result;
    };

    static addAloneActivitiesBlock = async (activitiesBlock) => {
        console.log("Gonna save alone activitiesBlock: ", activitiesBlock);
        let result;
        try {
            const newItem = new AloneActivitiesBlock(activitiesBlock);
            result = await newItem.save();
            console.log("Alone activitiesBlock added with result: ", result);
            console.log("Saved alone activitiesBlock: ", await Db.getAloneActivitiesBlockById(result._id));
        } catch(err) {
            console.log("Alone activitiesBlock adding error: ", err);
            result = false;
        }
        return result;
    };

    static addActivitiesBlock = async (tourId, activitiesBlock) => {

        const tour = await Db.getTourById(tourId);

        tour.activitiesBlocks.push(activitiesBlock);

        try {
            const result = await tour.save();
            console.log("ActivitiesBlock added: ", result);
            return result;
        } catch (err) {
            console.log("ActivitiesBlock adding error: ", err);
            return false;
        }
    };

    static deleteActivitiesBlock = async (tourId, activitiesBlockToDelete) => {

        console.log("ActivitiesBlock to delete: ", activitiesBlockToDelete);

        const tour = await Db.getTourById(tourId);

        console.log("Current ActivitiesBlocks: ", tour.activitiesBlocks);

        const newActivitiesBlocks = tour.activitiesBlocks.filter((activitiesBlock) => {
            return activitiesBlock._id.toString() !== activitiesBlockToDelete._id;
        });

        console.log("Old and new activitiesBlocks count: ", tour.activitiesBlocks.length, newActivitiesBlocks.length);

        if(tour.activitiesBlocks.length !== (newActivitiesBlocks.length + 1)) {
            console.log("Delete activitiesBlocks count error");
            return false;
        }

        tour.activitiesBlocks = newActivitiesBlocks;

        try {
            const result = await tour.save();
            console.log("ActivitiesBlock deleting result: ", result);
            return result;
        } catch (err) {
            console.log("ActivitiesBlock delete error: ", err);
            return false;
        }
    };

    static updateActivitiesBlock = async (tourId, activitiesBlockToUpdate) => {

        console.log("ActivitiesBlock to update: ", activitiesBlockToUpdate);

        const tour = await Db.getTourById(tourId);

        console.log("Current ActivitiesBlocks: ", tour.activitiesBlocks);

        const newActivitiesBlocks = tour.activitiesBlocks.map((activitiesBlock) => {
            if(activitiesBlock._id.toString() === activitiesBlockToUpdate._id.toString()) {
                console.log("There are block with id: ", activitiesBlock);
                return activitiesBlockToUpdate;
            } else {
                console.log("No activitiesBlocks with id");
            }
            return activitiesBlock;
        });

        console.log("Old and new activitiesBlocks count: ", tour.activitiesBlocks.length, newActivitiesBlocks.length);

        if(tour.activitiesBlocks.length !== (newActivitiesBlocks.length)) {
            console.log("Update activitiesBlocks count error");
            return false;
        }

        tour.activitiesBlocks = newActivitiesBlocks;

        try {
            const result = await tour.save();
            console.log("ActivitiesBlock updating result: ", result);
            return result;
        } catch (err) {
            console.log("ActivitiesBlock updating error: ", err);
            return false;
        }
    };

    static deleteTour = async (tourId) => {

        console.log("Tour to delete: ", tourId);

        try {
            const result = await Tour.deleteOne({ _id: tourId });
            console.log("Tour deleting result: ", result);
            return result;
        } catch (err) {
            console.log("Tour delete error: ", err);
            return false;
        }
    };

    static deleteLunch = async (tourId, startTime) => {

        console.log("Lunch to delete: ", tourId, new Date(startTime).toLocaleTimeString());

        const tour = await Db.getTourById(tourId);

        console.log("Current tour: ", tour);

        if(!("lunch" in tour)) {
            console.log("Delete lunch error: no lunch");
            return false;
        }

        const lunchToDeleteIndex = tour.lunch.findIndex((lunchObj) => isEqual(new Date(lunchObj.start), new Date(startTime)));

        if(lunchToDeleteIndex >= 0) {
            console.log("Lunch to delete: ", tour.lunch[lunchToDeleteIndex]);
        } else {
            console.log("Delete lunch error: no lunch with start: ", new Date(startTime).toLocaleTimeString());
            return false;
        }

        const newLunch = tour.lunch;
        newLunch.splice(lunchToDeleteIndex, 1);

        console.log("New lunches: ", newLunch);

        tour.lunch = newLunch;

        try {
            const result = await tour.save();
            console.log("Lunch deleting result: ", result);
            return result;
        } catch (err) {
            console.log("Lunch delete error: ", err);
            return false;
        }
    };

    static addLunch = async (tourId, startTime, endTime) => {

        console.log("Lunch to add: ", tourId, new Date(startTime).toLocaleTimeString(), new Date(endTime).toLocaleTimeString());

        const tour = await Db.getTourById(tourId);

        console.log("Current tour: ", tour);

        if(!tour) {
            console.log("Adding lunch error: no tour");
            return false;
        }

        if(!("lunch" in tour)) {
            tour.lunch = [];
        }

        if(!tour.lunch) {
            tour.lunch = [];
        }

        tour.lunch.push({
            start: startTime,
            end: endTime
        });

        try {
            const result = await tour.save();
            console.log("Lunch adding result: ", result);
            return result;
        } catch (err) {
            console.log("Lunch adding error: ", err);
            return false;
        }
    };

    static changeTourStartEnd = async(tourId, tourStart, tourEnd) => {

        let result;
        try{
            result = await Tour.findByIdAndUpdate(
                tourId, {
                    start: tourStart,
                    end: tourEnd
                }).exec();
        } catch (e) {
            console.log("Changing item error: ", e);
            return false;
        }
        return result;
    };

    static addOrder = async (dataObj) => {
        console.log("Gonna save order: ", dataObj);
        let result;
        try {
            const newItem = new Order(dataObj);
            result = await newItem.save();
            console.log("Order added with result: ", result);
            console.log("Saved order: ", await Db.getTourById(result._id));
        } catch(err) {
            console.log("Order adding error: ", err);
            result = false;
        }
        return result;
    };

    static addUser = async (name, pushToken) => {
        console.log("Gonna save user: ", name, pushToken);
        let result;
        try {
            const newItem = new User({ name, pushToken });
            result = await newItem.save();
            console.log("User added with result: ", result);
            console.log("Saved user: ", await Db.getUserById(result._id));
        } catch(err) {
            console.log("User adding error: ", err);
            result = false;
        }
        return result;
    }
}

module.exports = Db;