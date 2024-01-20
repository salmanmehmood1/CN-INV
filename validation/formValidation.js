function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    
    return false;
}

function phonenumber(inputtxt) {
    var phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if(inputtxt.value.match(phoneno)) {
      return true;
    }  
    else {  
      alert("message");
      return false;
    }
  }

  function validateSalary(salary) {
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    if (salary !== '' && salary.match(salaryRegex)) { return true; }
    return false;
  }

  function isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
}




