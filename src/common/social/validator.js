'use strict';

// constants
const CONSTANTS = require("../../../config/appConstants");

// npm modules
const joi = require('joi');

// local modules
const UniversalFunctions = require("../../../utils").universalFunctions;

const validator = {},
    failAction = UniversalFunctions.failActionFunction,
    authHeaderObj = UniversalFunctions.authorizationHeaderObj;

validator.homeData = {
  query: {
        countLimit: joi.number().optional().allow("")
},
  headers: authHeaderObj
};

validator.createPost = {
  payload: {
        type: joi.number().required(),
        tags: joi.string().optional().allow(""),
        postText: joi.string().optional().allow(""),
        imageUrl: joi.array().items(joi.object().keys({
            original: joi.string().optional().allow(""),
            thumbnail: joi.string().optional().allow("")
        })).optional(),
        taggedUsers: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};

validator.deletePost = {
  payload: {
        postId: joi.string().optional()
  },
  headers: authHeaderObj
};

validator.listSpeakouts = {
  query: {
        type: joi.number().required(),
        count: joi.number().optional().allow(""),
        lastId: joi.string().optional().allow(""),
        otherUserId: joi.string().optional().allow(""),
        keyword: joi.string().optional()
  },
  headers: authHeaderObj
};

validator.listExplorePosts = {
  query: {
        count: joi.number().optional().allow(""),
        lastId: joi.string().optional().allow(""),
        otherUserId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};

validator.followUnfollowUser = {
  payload: {
        action: joi.number().required(),
        userId: joi.string().required()
  },
  headers: authHeaderObj
};

validator.followList = {
  query: {
        type: joi.number().required(),
        searchUser: joi.string().optional().allow(""),
        count: joi.number().optional().allow(),
        lastId: joi.string().optional().allow(""),
        otherUserId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};

validator.postComment = {
  payload: {
        comment: joi.string().required(),
        postId: joi.string().required(),
        commentId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};
validator.deleteComment = {
  payload: {
        commentId: joi.string().optional()
  },
  headers: authHeaderObj
};

validator.likeUnlike = {
  payload: {
        userId: joi.string().required(),
        id: joi.string().required(),//post id
        type: joi.number().required(),
        action: joi.number().required()
  },
  headers: authHeaderObj
};

validator.sharePost = {
  payload: {
        postId: joi.string().required()
  },
  headers: authHeaderObj
};

validator.postDetails = {
  query: {
        postId: joi.string().required()
  },
  headers: authHeaderObj
};
validator.viewPost = {
  payload: {
        postId: joi.string().required()
  },
  headers: authHeaderObj
};

validator.reportPost = {
  payload: {
        postId: joi.string().required(),
        reportText: joi.string().required()
  },
  headers: authHeaderObj
};

validator.getPostsByTag = {
  query: {
        tag: joi.string().required()
  },
  headers: authHeaderObj
};
validator.addRemoveContact = {
  payload: {
        action: joi.number().required(),
        userId: joi.string().required()
  },
  headers: authHeaderObj
};
validator.addRemoveFavourite = {
  payload: {
        action: joi.number().required(),
        userId: joi.string().required(),
        role: joi.string().required()
  },
  headers: authHeaderObj
};
validator.addRemoveRescuer = {
  payload: {
        action: joi.number().required(),
        contactId: joi.string().required()
  },
  headers: authHeaderObj
};


module.exports = validator;
