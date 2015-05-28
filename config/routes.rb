Rails.application.routes.draw do
  root to: "root#root"
  get '/high_scores/snake', to: 'high_scores#snake', as: "snake_score", defaults: {format: :json}
  resources :high_scores
end
