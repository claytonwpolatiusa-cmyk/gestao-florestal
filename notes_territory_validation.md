# Validação da experiência territorial

Em 10/09/2026, a rota `/talhoes` foi revisada em desktop. A nova tela exibiu a estrutura simplificada de **Áreas e talhões**, ações de **Nova área** e **Novo talhão**, visão territorial consolidada, cartões de indicadores e botões de edição e exclusão por área.

A primeira visualização confirmou que o registro existente aponta para um arquivo com extensão `.kmz`, embora esteja catalogado como KML. A leitura de KMZ foi então adicionada com descompactação do KML interno. A captura imediatamente posterior ficou em branco enquanto o servidor reotimizava dependências após a instalação do leitor de KMZ; é necessário repetir a captura após a estabilização do servidor antes de declarar a renderização do recorte validada.

Após a estabilização, a nova captura confirmou **1 recorte** e exibiu o polígono do talhão `S-2` no mapa consolidado. Isso valida a leitura do arquivo KMZ existente e a visualização espacial relativa do seu limite no painel territorial.
