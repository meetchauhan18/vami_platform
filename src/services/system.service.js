import systemRepository from "../repositories/system.repository.js";

class SystemService{
    constructor(SystemRepository){
        this.SystemRepository = SystemRepository;
    }

    async getUsers(){
        return await this.SystemRepository.getUsers();
    }

    async getSystemStats(){
        return await this.SystemRepository.getSystemStats();
    }
}

export default new SystemService(systemRepository);