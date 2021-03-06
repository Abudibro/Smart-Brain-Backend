const handleRegister =  (req, res, db, bcrypt) => {
    
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('Invalid credentials');
    }

    const salt =  bcrypt.genSalt()
    const hashedPassword =  bcrypt.hash(password, salt)
    db.transaction(trx => {
        trx.insert({
            hash: hashedPassword,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
                })
                .then(user => res.json(user[0]))
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err, "Unable to register"))


}

module.exports = {
    handleRegister: handleRegister
}