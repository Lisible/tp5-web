class Contact {
    constructor(id, firstName, lastName, phoneNumber, emailAddress, homeAddress){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.emailAddress = emailAddress;
        this.homeAddress = homeAddress;
        this.element = null;
    }

    attachView(element) {
        this.element = element;
    }
    getView() {
        return this.element;
    }

    getId() {
        return this.id;
    }

    getFirstName() {
        return this.firstName;
    }
    setFirstName(firstName) {
        this.firstName = firstName;
    }

    getLastName() {
        return this.lastName;
    }
    setLastName(lastName) {
        this.lastName = lastName;
    }

    getPhoneNumber() {
        return this.phoneNumber;
    }
    setPhoneNumber(phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    getEmailAddress() {
        return this.emailAddress;
    }
    setEmailAddress(emailAddress) {
        this.emailAddress = emailAddress;
    }

    getHomeAddress() {
        return this.homeAddress;
    }
    setHomeAddress(homeAddress) {
        this.homeAddress = homeAddress;
    }
}

class ContactList {
    constructor(controller){
        this.controller = controller;
        this.element = document.getElementById('contact-list-wrapper');
        this.contacts = [];
    }

    loadContacts() {
        fetch("http://localhost:8080/ContactAPI/contact")
            .then(response => response.json())
            .then((data) => {
                this.contacts = [];
                let contactsData = data;
                contactsData.forEach((contactData) =>{
                    this.contacts.push(new Contact(contactData.id, contactData.firstName, contactData.lastName, contactData.phoneNumber, contactData.emailAddress, contactData.homeAddress));
                });

                this.updateView();       
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    getContacts() {
        return this.contacts;
    }

    updateView() {
        let list = document.getElementById('contact-list');

        while(list.hasChildNodes())
            list.removeChild(list.lastChild);

        this.contacts.forEach((contact) => {
            let listItemElement = document.createElement('li');
            let editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.innerHTML = "Éditer";

            let deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.innerHTML = "Supprimer";

            listItemElement.innerHTML = contact.getFirstName() + ' ' + contact.getLastName() 
            listItemElement.appendChild(deleteButton);
            listItemElement.appendChild(editButton);
            contact.attachView(listItemElement);
            list.appendChild(listItemElement);

            listItemElement.addEventListener('click', () => this.controller.onContactViewClick(contact));
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.controller.onDeleteButtonClicked(contact)
            });
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.controller.onEditButtonClicked(contact);
            });
        });
   }

   getAddContactButton() {
       return document.getElementById('add-contact-button');
   }

   hide() {
        this.element.classList.add('hidden');
   }

   show() {
       this.element.classList.remove('hidden');
   }
}

class ContactDetails {
    constructor() {
        this.element = document.getElementById('contact-details-wrapper')
    }

    setDetails(contact) {
        document.querySelector('#details-firstname').innerHTML = contact.getFirstName();
        document.querySelector('#details-lastname').innerHTML = contact.getLastName();
        document.querySelector('#details-phonenumber').innerHTML = contact.getPhoneNumber();
        document.querySelector('#details-email').innerHTML = contact.getEmailAddress();
        document.querySelector('#details-home').innerHTML = contact.getHomeAddress();
    }

    getBackButton() {
        return document.querySelector('#details-back-button');
    }

    hide() {
        this.element.classList.add('hidden');
    }

    show() {
        this.element.classList.remove('hidden');
    }


}

class ContactForm {
    constructor() {
        this.mode = 'add';
        this.element = document.getElementById('contact-form-wrapper');
    }

    changeMode(mode) {
        this.mode = mode;
    }
    getMode() {
        return this.mode;
    }

    getFormBackButton() {
        return document.getElementById('form-back-button');
    }

    getFormConfirmButton() {
        return document.querySelector('#contact-form-wrapper input[type="button"]');
    }

    getEntries() {
        let entries = {};
        entries.firstName = document.querySelector('#contact-form-wrapper input[name="firstname-input"]').value;
        entries.lastName = document.querySelector('#contact-form-wrapper input[name="lastname-input"]').value;
        entries.phoneNumber = document.querySelector('#contact-form-wrapper input[name="phonenumber-input"]').value;
        entries.emailAddress = document.querySelector('#contact-form-wrapper input[name="email-input"]').value;
        entries.homeAddress = document.querySelector('#contact-form-wrapper input[name="home-input"]').value;

        return entries;
    }

    presetEntries(contact) {
        document.querySelector('#contact-form-wrapper input[name="firstname-input"]').value = contact.getFirstName();
        document.querySelector('#contact-form-wrapper input[name="lastname-input"]').value = contact.getLastName();
        document.querySelector('#contact-form-wrapper input[name="phonenumber-input"]').value = contact.getPhoneNumber();
        document.querySelector('#contact-form-wrapper input[name="email-input"]').value = contact.getEmailAddress();
        document.querySelector('#contact-form-wrapper input[name="home-input"]').value = contact.getHomeAddress();
    }

    emptyFields() {
        let formInputs = document.querySelectorAll('#contact-form-wrapper form input[type="text"]');
        formInputs.forEach((e) => e.value = "");
    }

    hide() {
        this.element.classList.add('hidden');
    }

    show(contact) {
        this.element.classList.remove('hidden');
        if(contact !== undefined && this.getMode() === 'edit') {
            this.presetEntries(contact);
        }
    }
}

class Controller {
    constructor() {
        this.contactList = new ContactList(this);
        this.contactList.loadContacts();

        this.contactDetails = new ContactDetails();

        this.contactForm = new ContactForm();

        this.registerEventHandlers();
    }

    onAddContactButtonClick() {
        this.contactList.hide();

        this.contactForm.changeMode('add');
        this.contactForm.show();
    }

    onFormBackButtonClick() {
        this.contactForm.emptyFields();
        this.contactForm.hide();
        this.contactList.show();
    }

    updateContact(id, data) {
        fetch("http://localhost:8080/ContactAPI/contact/" + id, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(data)
            }).then((res) => {
                this.contactForm.hide();
                this.contactForm.emptyFields();

                this.contactList.loadContacts();
                this.contactList.show();
            }).catch((err) => {
                console.log(err);
            });
    }

    addContact(data) {
        fetch("http://localhost:8080/ContactAPI/contact", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
            }).then((res) => {
                this.contactForm.hide();
                this.contactForm.emptyFields();

                this.contactList.loadContacts();
                this.contactList.show();
            }).catch((err) => {
                console.log(err);
            });
    }

    onFormConfirmButtonClick() {
        const entries = this.contactForm.getEntries();
        if(this.editing !== undefined && this.contactForm.getMode() === 'edit') {
            this.updateContact(this.editing, entries);
        }
        else {
            this.addContact(entries);
        }
    }

    onContactViewClick(contact) {
        this.contactList.hide();
        this.contactDetails.setDetails(contact);
        this.contactDetails.show();
    }

    onDetailsBackButtonClick() {
        this.contactDetails.hide();
        this.contactList.show();
    }

    onDeleteButtonClicked(contact) {
        fetch("http://localhost:8080/ContactAPI/contact/" + contact.getId(), {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        }).then((res) => {
            this.contactList.loadContacts();
        }).catch((err) => {
            console.log(err);
        });
    }

    onEditButtonClicked(contact) {
        this.contactList.hide();

        this.editing = contact.getId();
        this.contactForm.changeMode('edit');
        this.contactForm.show(contact);
    }

    registerEventHandlers() {
        this.contactList.getAddContactButton().addEventListener('click', () => this.onAddContactButtonClick());
        this.contactForm.getFormBackButton().addEventListener('click', () => this.onFormBackButtonClick());
        this.contactForm.getFormConfirmButton().addEventListener('click', () => this.onFormConfirmButtonClick());
        this.contactDetails.getBackButton().addEventListener('click', () => this.onDetailsBackButtonClick());
    }
}


window.addEventListener("load", function(){
    let controller = new Controller();
});