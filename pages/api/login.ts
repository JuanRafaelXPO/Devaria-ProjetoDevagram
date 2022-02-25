import type { NextApiRequest, NextApiResponse } from "next";

export default (
    req : NextApiRequest,
    res : NextApiResponse
) => {
    if(req.method === 'POST'){
        const {login, senha} = req.body;

        if(login === 'admin@admin.com' &&
            senha === 'admin123'){
            res.status(200).json({msg : 'Usuário logado em sucesso.'});
        }
        return res.status(405).json({erro : 'Usuário não encontrado.'});
    }
    return res.status(405).json({erro : 'O método informado não é valido.'});
}