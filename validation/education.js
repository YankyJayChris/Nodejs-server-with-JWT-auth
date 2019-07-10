const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateeducationInput(data) {
    let errors = {};


    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    
    if(!Validator.isEmpty(data.school)){
        errors.school = 'school is required';
    }
    
    if(!Validator.isEmpty(data.degree)){
        errors.degree = 'degree is required';
    }
    if(!Validator.isEmpty(data.fieldofstudy)){
        errors.fieldofstudy = 'field of study is required';
    }

    if(!Validator.isEmpty(data.from)){
        errors.from = 'from is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
    
}