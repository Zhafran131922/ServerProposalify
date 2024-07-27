const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        res.status(201).json({ message: 'Pengguna berhasil dibuat', user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat membuat pengguna');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mendapatkan pengguna');
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mendapatkan pengguna');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, password } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        user.username = username;
        user.email = email;
        user.password = password;

        await user.save();

        res.status(200).json({ message: 'Pengguna berhasil diperbarui', user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat memperbarui pengguna');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        await user.remove();

        res.status(200).json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat menghapus pengguna');
    }
};

exports.registerUser = async (req, res) => {
    try {
        res.send('Registrasi pengguna berhasil');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat melakukan registrasi pengguna');
    }
};
