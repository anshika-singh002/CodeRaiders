const authorize = (requiredRoles)=> {
    return (req, res, next)=>{
        //req.user should be populated by the preceding authentication middleware (auth.js)
        if(!req.user || !req.user.role){
            //this senariio should ideally be caught by 'auth' middleware first,
            //but its good defensive check.
            return re.status(401).json({message: 'Authentication required or role missing.'});
        }
        const userRole=req.user.role;

        //check if the user's role is included in the required roles array
        if(!requiredRoles.include(userRole)){
            return res.status(403).json({message: 'Forbidden: You do not have the neccessary permissions.'});

        }

        next(); //user has the required role, proceed
    };
};

export default authorize;