Rails.application.routes.draw do
  resources :high_scores
  root to: "root#root"
  get '/high_score/snake', to: 'high_scoresr#snake', as: "snake_score", defaults: {format: :json}
end
