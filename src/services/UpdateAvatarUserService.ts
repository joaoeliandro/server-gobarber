import fs from 'fs';
import path from 'path';
import { getRepository } from 'typeorm';

import User from '../models/User';
import AppError from '../errors/AppError';
import uploadConfig from '../config/upload';

interface RequestDTO {
    user_id: string;
    avatarFileName: string;
}

class UpdateAvatarUserService {
    public async execute({
        user_id,
        avatarFileName,
    }: RequestDTO): Promise<User> {
        const userRepository = getRepository(User);

        const user = await userRepository.findOne(user_id);

        if (!user)
            throw new AppError(
                'Only authenticated users can change avatar.',
                401,
            );

        if (user.avatar) {
            const userAvatarFilePath = path.join(
                uploadConfig.directory,
                user.avatar,
            );

            const userAvatarFileExists = await fs.promises.stat(
                userAvatarFilePath,
            );

            if (userAvatarFileExists)
                await fs.promises.unlink(userAvatarFilePath);
        }

        user.avatar = avatarFileName;

        await userRepository.save(user);

        return user;
    }
}

export default UpdateAvatarUserService;
